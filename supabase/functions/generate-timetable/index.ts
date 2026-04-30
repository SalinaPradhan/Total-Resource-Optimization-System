import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Types
interface Course {
  id: string;
  code: string;
  name: string;
  department: string;
  weekly_hours: number;
  requires_lab: boolean;
  requires_projector: boolean;
}

interface Faculty {
  id: string;
  name: string;
  department: string;
  subjects: string[];
  max_load: number;
  current_load: number;
  status: string;
}

interface Room {
  id: string;
  name: string;
  type: string;
  capacity: number;
  has_projector: boolean;
  status: string;
}

interface Batch {
  id: string;
  name: string;
  stream: string;
  semester: number;
  size: number;
}

interface Staff {
  id: string;
  name: string;
  role: string;
  shift: string;
  status: string;
}

interface FacultyAvailability {
  id: string;
  faculty_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  preference_type: 'Preferred' | 'Available' | 'Unavailable';
}

interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}

interface ScheduleGene {
  courseId: string;
  facultyId: string;
  batchId: string;
  roomId: string;
  staffId: string | null;
  timeSlot: TimeSlot;
  type: 'lecture' | 'lab' | 'tutorial';
}

interface Weights {
  hardClash: number;
  roomConstraint: number;
  staffAvailability: number;
  infrastructure: number;
  facultyUnavailable: number;
  facultyPreferred: number;
}

interface AlgorithmParams {
  populationSize: number;
  maxGenerations: number;
  mutationRate: number;
  crossoverRate: number;
  eliteCount: number;
}

// Constants
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS: TimeSlot[] = [
  { day: '', startTime: '09:00', endTime: '10:00' },
  { day: '', startTime: '10:00', endTime: '11:00' },
  { day: '', startTime: '11:00', endTime: '12:00' },
  { day: '', startTime: '12:00', endTime: '13:00' },
  { day: '', startTime: '14:00', endTime: '15:00' },
  { day: '', startTime: '15:00', endTime: '16:00' },
  { day: '', startTime: '16:00', endTime: '17:00' },
];

// Generate all possible time slots
function getAllTimeSlots(): TimeSlot[] {
  const slots: TimeSlot[] = [];
  for (const day of DAYS) {
    for (const slot of TIME_SLOTS) {
      slots.push({ ...slot, day });
    }
  }
  return slots;
}

// Helper to check if a time slot falls within an availability window
function isTimeInRange(slotStart: string, slotEnd: string, rangeStart: string, rangeEnd: string): boolean {
  // Convert times to comparable numbers (minutes from midnight)
  const toMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  const slotStartMin = toMinutes(slotStart);
  const slotEndMin = toMinutes(slotEnd);
  const rangeStartMin = toMinutes(rangeStart);
  const rangeEndMin = toMinutes(rangeEnd);
  
  // Slot is within range if it starts at or after range start and ends at or before range end
  return slotStartMin >= rangeStartMin && slotEndMin <= rangeEndMin;
}

// Genetic Algorithm Implementation
class GeneticAlgorithm {
  private courses: Course[];
  private faculty: Faculty[];
  private rooms: Room[];
  private batches: Batch[];
  private staff: Staff[];
  private facultyAvailability: FacultyAvailability[];
  private weights: Weights;
  private params: AlgorithmParams;
  private allTimeSlots: TimeSlot[];
  private courseAssignments: Map<string, { facultyId: string; batchId: string }[]>;
  
  // Cache for faculty availability lookups
  private facultyAvailabilityMap: Map<string, FacultyAvailability[]>;

  constructor(
    courses: Course[],
    faculty: Faculty[],
    rooms: Room[],
    batches: Batch[],
    staff: Staff[],
    facultyAvailability: FacultyAvailability[],
    weights: Weights,
    params: AlgorithmParams
  ) {
    this.courses = courses.filter(c => c.weekly_hours > 0);
    this.faculty = faculty.filter(f => f.status === 'available');
    this.rooms = rooms.filter(r => r.status === 'available');
    this.batches = batches;
    this.staff = staff.filter(s => s.status === 'available');
    this.facultyAvailability = facultyAvailability;
    this.weights = weights;
    this.params = params;
    this.allTimeSlots = getAllTimeSlots();
    this.courseAssignments = this.createCourseAssignments();
    
    // Build availability lookup map for performance
    this.facultyAvailabilityMap = new Map();
    for (const avail of facultyAvailability) {
      if (!this.facultyAvailabilityMap.has(avail.faculty_id)) {
        this.facultyAvailabilityMap.set(avail.faculty_id, []);
      }
      this.facultyAvailabilityMap.get(avail.faculty_id)!.push(avail);
    }
    
    console.log(`Faculty availability loaded: ${facultyAvailability.length} entries for ${this.facultyAvailabilityMap.size} faculty members`);
  }

  // Get faculty availability preference for a specific time slot
  private getFacultySlotPreference(facultyId: string, timeSlot: TimeSlot): 'Preferred' | 'Available' | 'Unavailable' | null {
    const availability = this.facultyAvailabilityMap.get(facultyId);
    if (!availability || availability.length === 0) {
      return null; // No preferences set = treat as available
    }
    
    // Find matching availability entry for this day and time
    for (const avail of availability) {
      if (avail.day_of_week === timeSlot.day) {
        if (isTimeInRange(timeSlot.startTime, timeSlot.endTime, avail.start_time, avail.end_time)) {
          return avail.preference_type;
        }
      }
    }
    
    return null; // No specific preference for this slot
  }

  // Get time slots that are preferred or available for a faculty member
  private getPreferredSlotsForFaculty(facultyId: string): TimeSlot[] {
    const availability = this.facultyAvailabilityMap.get(facultyId);
    if (!availability || availability.length === 0) {
      return this.allTimeSlots; // No preferences = all slots available
    }
    
    const preferredSlots: TimeSlot[] = [];
    const availableSlots: TimeSlot[] = [];
    const unavailableSlots = new Set<string>();
    
    // Identify unavailable slots first
    for (const avail of availability) {
      if (avail.preference_type === 'Unavailable') {
        for (const slot of this.allTimeSlots) {
          if (slot.day === avail.day_of_week && 
              isTimeInRange(slot.startTime, slot.endTime, avail.start_time, avail.end_time)) {
            unavailableSlots.add(`${slot.day}-${slot.startTime}`);
          }
        }
      }
    }
    
    // Collect preferred and available slots
    for (const slot of this.allTimeSlots) {
      const slotKey = `${slot.day}-${slot.startTime}`;
      if (unavailableSlots.has(slotKey)) continue;
      
      const preference = this.getFacultySlotPreference(facultyId, slot);
      if (preference === 'Preferred') {
        preferredSlots.push(slot);
      } else {
        availableSlots.push(slot);
      }
    }
    
    // Return preferred slots first, then available slots
    return [...preferredSlots, ...availableSlots];
  }

  // Create course-faculty-batch assignments based on department matching
  private createCourseAssignments(): Map<string, { facultyId: string; batchId: string }[]> {
    const assignments = new Map<string, { facultyId: string; batchId: string }[]>();
    
    for (const course of this.courses) {
      const matchingFaculty = this.faculty.filter(f => 
        f.department === course.department || 
        f.subjects?.includes(course.code) ||
        f.subjects?.includes(course.name)
      );
      
      if (matchingFaculty.length === 0) continue;
      
      const courseAssigns: { facultyId: string; batchId: string }[] = [];
      for (const batch of this.batches) {
        const faculty = matchingFaculty[Math.floor(Math.random() * matchingFaculty.length)];
        courseAssigns.push({ facultyId: faculty.id, batchId: batch.id });
      }
      assignments.set(course.id, courseAssigns);
    }
    
    return assignments;
  }

  // Generate a single random schedule (chromosome) - now considers faculty availability
  private generateRandomChromosome(): ScheduleGene[] {
    const chromosome: ScheduleGene[] = [];
    const usedSlots = new Map<string, Set<string>>();

    for (const [courseId, assigns] of this.courseAssignments) {
      const course = this.courses.find(c => c.id === courseId);
      if (!course) continue;

      for (const assign of assigns) {
        // Calculate number of slots needed based on weekly hours
        const slotsNeeded = course.weekly_hours;
        
        // Get preferred time slots for this faculty member
        const preferredSlots = this.getPreferredSlotsForFaculty(assign.facultyId);
        
        for (let i = 0; i < slotsNeeded; i++) {
          // Prefer using faculty's preferred slots (first 70% of attempts use preferred slots)
          let timeSlot: TimeSlot;
          if (preferredSlots.length > 0 && Math.random() < 0.7) {
            timeSlot = preferredSlots[Math.floor(Math.random() * preferredSlots.length)];
          } else {
            timeSlot = this.allTimeSlots[Math.floor(Math.random() * this.allTimeSlots.length)];
          }
          
          // Select appropriate room
          const suitableRooms = this.rooms.filter(r => {
            if (course.requires_lab && r.type !== 'lab') return false;
            if (course.requires_projector && !r.has_projector) return false;
            const batch = this.batches.find(b => b.id === assign.batchId);
            if (batch && r.capacity < batch.size) return false;
            return true;
          });
          
          const room = suitableRooms.length > 0 
            ? suitableRooms[Math.floor(Math.random() * suitableRooms.length)]
            : this.rooms[Math.floor(Math.random() * this.rooms.length)];

          // Assign staff for lab sessions
          let staffId: string | null = null;
          if (course.requires_lab && this.staff.length > 0) {
            const labStaff = this.staff.filter(s => s.role === 'lab_assistant');
            if (labStaff.length > 0) {
              staffId = labStaff[Math.floor(Math.random() * labStaff.length)].id;
            }
          }

          chromosome.push({
            courseId,
            facultyId: assign.facultyId,
            batchId: assign.batchId,
            roomId: room.id,
            staffId,
            timeSlot,
            type: course.requires_lab ? 'lab' : 'lecture',
          });
        }
      }
    }

    return chromosome;
  }

  // Calculate fitness (lower is better - we minimize conflicts)
  private calculateFitness(chromosome: ScheduleGene[]): number {
    let penalty = 0;

    // Track usage for conflict detection
    const facultySlots = new Map<string, Set<string>>();
    const roomSlots = new Map<string, Set<string>>();
    const batchSlots = new Map<string, Set<string>>();
    const staffSlots = new Map<string, Set<string>>();

    for (const gene of chromosome) {
      const slotKey = `${gene.timeSlot.day}-${gene.timeSlot.startTime}`;

      // Hard clash - Faculty double booking
      const facultyKey = gene.facultyId;
      if (!facultySlots.has(facultyKey)) facultySlots.set(facultyKey, new Set());
      if (facultySlots.get(facultyKey)!.has(slotKey)) {
        penalty += this.weights.hardClash;
      }
      facultySlots.get(facultyKey)!.add(slotKey);

      // Hard clash - Room double booking
      const roomKey = gene.roomId;
      if (!roomSlots.has(roomKey)) roomSlots.set(roomKey, new Set());
      if (roomSlots.get(roomKey)!.has(slotKey)) {
        penalty += this.weights.hardClash;
      }
      roomSlots.get(roomKey)!.add(slotKey);

      // Hard clash - Batch double booking
      const batchKey = gene.batchId;
      if (!batchSlots.has(batchKey)) batchSlots.set(batchKey, new Set());
      if (batchSlots.get(batchKey)!.has(slotKey)) {
        penalty += this.weights.hardClash;
      }
      batchSlots.get(batchKey)!.add(slotKey);

      // Room constraint - Check room suitability
      const course = this.courses.find(c => c.id === gene.courseId);
      const room = this.rooms.find(r => r.id === gene.roomId);
      const batch = this.batches.find(b => b.id === gene.batchId);

      if (course && room) {
        if (course.requires_lab && room.type !== 'lab') {
          penalty += this.weights.roomConstraint;
        }
        if (course.requires_projector && !room.has_projector) {
          penalty += this.weights.infrastructure;
        }
        if (batch && room.capacity < batch.size) {
          penalty += this.weights.roomConstraint;
        }
      }

      // Staff availability - Check if lab session has staff assigned
      if (gene.type === 'lab') {
        if (!gene.staffId) {
          penalty += this.weights.staffAvailability;
        } else {
          const staffKey = gene.staffId;
          if (!staffSlots.has(staffKey)) staffSlots.set(staffKey, new Set());
          if (staffSlots.get(staffKey)!.has(slotKey)) {
            penalty += this.weights.staffAvailability;
          }
          staffSlots.get(staffKey)!.add(slotKey);
        }
      }

      // Faculty availability preference check
      const facultyPreference = this.getFacultySlotPreference(gene.facultyId, gene.timeSlot);
      if (facultyPreference === 'Unavailable') {
        // Heavy penalty for scheduling during unavailable times
        penalty += this.weights.facultyUnavailable;
      } else if (facultyPreference === 'Preferred') {
        // Reward (negative penalty) for using preferred times
        penalty -= this.weights.facultyPreferred;
      }
      // 'Available' or null (no preference) = no penalty adjustment
    }

    return penalty;
  }

  // Tournament selection
  private tournamentSelect(population: ScheduleGene[][], fitnesses: number[]): ScheduleGene[] {
    const tournamentSize = 3;
    let best = -1;
    let bestFitness = Infinity;

    for (let i = 0; i < tournamentSize; i++) {
      const idx = Math.floor(Math.random() * population.length);
      if (fitnesses[idx] < bestFitness) {
        best = idx;
        bestFitness = fitnesses[idx];
      }
    }

    return population[best];
  }

  // Crossover - Uniform crossover
  private crossover(parent1: ScheduleGene[], parent2: ScheduleGene[]): [ScheduleGene[], ScheduleGene[]] {
    if (Math.random() > this.params.crossoverRate) {
      return [parent1.slice(), parent2.slice()];
    }

    const child1: ScheduleGene[] = [];
    const child2: ScheduleGene[] = [];
    const minLen = Math.min(parent1.length, parent2.length);

    for (let i = 0; i < minLen; i++) {
      if (Math.random() < 0.5) {
        child1.push({ ...parent1[i] });
        child2.push({ ...parent2[i] });
      } else {
        child1.push({ ...parent2[i] });
        child2.push({ ...parent1[i] });
      }
    }

    // Handle remaining genes if parents have different lengths
    for (let i = minLen; i < parent1.length; i++) {
      child1.push({ ...parent1[i] });
    }
    for (let i = minLen; i < parent2.length; i++) {
      child2.push({ ...parent2[i] });
    }

    return [child1, child2];
  }

  // Mutation - Randomly change time slots and rooms, now considering faculty availability
  private mutate(chromosome: ScheduleGene[]): ScheduleGene[] {
    const mutated = chromosome.map(gene => {
      if (Math.random() < this.params.mutationRate) {
        const newGene = { ...gene };
        
        // Mutate time slot - prefer faculty's available/preferred slots
        if (Math.random() < 0.5) {
          const preferredSlots = this.getPreferredSlotsForFaculty(gene.facultyId);
          if (preferredSlots.length > 0 && Math.random() < 0.8) {
            // 80% chance to use a preferred/available slot during mutation
            newGene.timeSlot = preferredSlots[Math.floor(Math.random() * preferredSlots.length)];
          } else {
            newGene.timeSlot = this.allTimeSlots[Math.floor(Math.random() * this.allTimeSlots.length)];
          }
        }
        
        // Mutate room
        if (Math.random() < 0.3) {
          const course = this.courses.find(c => c.id === gene.courseId);
          const suitableRooms = this.rooms.filter(r => {
            if (course?.requires_lab && r.type !== 'lab') return false;
            return true;
          });
          if (suitableRooms.length > 0) {
            newGene.roomId = suitableRooms[Math.floor(Math.random() * suitableRooms.length)].id;
          }
        }
        
        return newGene;
      }
      return { ...gene };
    });

    return mutated;
  }

  // Main evolution loop
  async evolve(): Promise<{
    bestSchedule: ScheduleGene[];
    bestFitness: number;
    generations: number;
    conflicts: number;
    availabilityViolations: number;
  }> {
    console.log('Starting genetic algorithm evolution...');
    console.log(`Courses: ${this.courses.length}, Faculty: ${this.faculty.length}, Rooms: ${this.rooms.length}, Batches: ${this.batches.length}`);
    console.log(`Faculty availability entries: ${this.facultyAvailability.length}`);

    // Handle edge case: no valid data
    if (this.courses.length === 0 || this.faculty.length === 0 || this.rooms.length === 0 || this.batches.length === 0) {
      console.log('Insufficient data for schedule generation');
      return { bestSchedule: [], bestFitness: 0, generations: 0, conflicts: 0, availabilityViolations: 0 };
    }

    // Initialize population
    let population: ScheduleGene[][] = [];
    for (let i = 0; i < this.params.populationSize; i++) {
      population.push(this.generateRandomChromosome());
    }

    let bestEverFitness = Infinity;
    let bestEverSchedule: ScheduleGene[] = [];
    let generationsWithoutImprovement = 0;

    for (let gen = 0; gen < this.params.maxGenerations; gen++) {
      // Calculate fitness for all chromosomes
      const fitnesses = population.map(chrom => this.calculateFitness(chrom));
      
      // Find best in this generation
      const minFitness = Math.min(...fitnesses);
      const bestIdx = fitnesses.indexOf(minFitness);
      
      if (minFitness < bestEverFitness) {
        bestEverFitness = minFitness;
        bestEverSchedule = population[bestIdx].slice();
        generationsWithoutImprovement = 0;
        if (gen % 20 === 0 || gen < 10) {
          console.log(`Generation ${gen}: New best fitness = ${minFitness}`);
        }
      } else {
        generationsWithoutImprovement++;
      }

      // Early termination if optimal solution found (fitness can be negative due to preferred slot rewards)
      if (bestEverFitness <= 0 && generationsWithoutImprovement > 10) {
        console.log(`Near-optimal solution found at generation ${gen}`);
        break;
      }

      // Early termination if stuck
      if (generationsWithoutImprovement > 50) {
        console.log(`Converged at generation ${gen}`);
        break;
      }

      // Create new population
      const newPopulation: ScheduleGene[][] = [];

      // Elitism - keep best chromosomes
      const sortedIndices = fitnesses
        .map((f, i) => ({ fitness: f, index: i }))
        .sort((a, b) => a.fitness - b.fitness)
        .map(x => x.index);

      for (let i = 0; i < this.params.eliteCount && i < sortedIndices.length; i++) {
        newPopulation.push(population[sortedIndices[i]].slice());
      }

      // Generate rest of population
      while (newPopulation.length < this.params.populationSize) {
        const parent1 = this.tournamentSelect(population, fitnesses);
        const parent2 = this.tournamentSelect(population, fitnesses);
        
        const [child1, child2] = this.crossover(parent1, parent2);
        
        newPopulation.push(this.mutate(child1));
        if (newPopulation.length < this.params.populationSize) {
          newPopulation.push(this.mutate(child2));
        }
      }

      population = newPopulation;
    }

    // Count actual conflicts and availability violations in best schedule
    const { conflicts, availabilityViolations } = this.countConflictsAndViolations(bestEverSchedule);
    
    console.log(`Evolution complete. Best fitness: ${bestEverFitness}, Conflicts: ${conflicts}, Availability violations: ${availabilityViolations}`);

    return {
      bestSchedule: bestEverSchedule,
      bestFitness: bestEverFitness,
      generations: this.params.maxGenerations,
      conflicts,
      availabilityViolations,
    };
  }

  private countConflictsAndViolations(chromosome: ScheduleGene[]): { conflicts: number; availabilityViolations: number } {
    let conflicts = 0;
    let availabilityViolations = 0;
    const facultySlots = new Map<string, Set<string>>();
    const roomSlots = new Map<string, Set<string>>();
    const batchSlots = new Map<string, Set<string>>();

    for (const gene of chromosome) {
      const slotKey = `${gene.timeSlot.day}-${gene.timeSlot.startTime}`;

      // Check faculty conflicts
      if (!facultySlots.has(gene.facultyId)) facultySlots.set(gene.facultyId, new Set());
      if (facultySlots.get(gene.facultyId)!.has(slotKey)) conflicts++;
      facultySlots.get(gene.facultyId)!.add(slotKey);

      // Check room conflicts
      if (!roomSlots.has(gene.roomId)) roomSlots.set(gene.roomId, new Set());
      if (roomSlots.get(gene.roomId)!.has(slotKey)) conflicts++;
      roomSlots.get(gene.roomId)!.add(slotKey);

      // Check batch conflicts
      if (!batchSlots.has(gene.batchId)) batchSlots.set(gene.batchId, new Set());
      if (batchSlots.get(gene.batchId)!.has(slotKey)) conflicts++;
      batchSlots.get(gene.batchId)!.add(slotKey);

      // Check faculty availability violations
      const preference = this.getFacultySlotPreference(gene.facultyId, gene.timeSlot);
      if (preference === 'Unavailable') {
        availabilityViolations++;
      }
    }

    return { conflicts, availabilityViolations };
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Received generate-timetable request');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const body = await req.json();
    const { 
      weights = { 
        hardClash: 1000, 
        roomConstraint: 500, 
        staffAvailability: 200, 
        infrastructure: 200,
        facultyUnavailable: 800,  // Heavy penalty for scheduling during unavailable times
        facultyPreferred: 50,     // Small reward for using preferred times
      },
      params = { populationSize: 50, maxGenerations: 200, mutationRate: 0.1, crossoverRate: 0.8, eliteCount: 5 },
      academicYear = '2024-2025',
      semester = 1,
      clearExisting = false
    } = body;

    console.log('Fetching data from database...');

    // Fetch all required data including faculty availability
    const [coursesRes, facultyRes, roomsRes, batchesRes, staffRes, availabilityRes] = await Promise.all([
      supabase.from('courses').select('*'),
      supabase.from('faculty').select('*'),
      supabase.from('rooms').select('*'),
      supabase.from('batches').select('*'),
      supabase.from('support_staff').select('*'),
      supabase.from('faculty_availability').select('*'),
    ]);

    if (coursesRes.error) throw new Error(`Courses fetch error: ${coursesRes.error.message}`);
    if (facultyRes.error) throw new Error(`Faculty fetch error: ${facultyRes.error.message}`);
    if (roomsRes.error) throw new Error(`Rooms fetch error: ${roomsRes.error.message}`);
    if (batchesRes.error) throw new Error(`Batches fetch error: ${batchesRes.error.message}`);
    if (staffRes.error) throw new Error(`Staff fetch error: ${staffRes.error.message}`);
    if (availabilityRes.error) throw new Error(`Faculty availability fetch error: ${availabilityRes.error.message}`);

    const courses = coursesRes.data || [];
    const faculty = facultyRes.data || [];
    const rooms = roomsRes.data || [];
    const batches = batchesRes.data || [];
    const staff = staffRes.data || [];
    const facultyAvailability = availabilityRes.data || [];

    console.log(`Data loaded: ${courses.length} courses, ${faculty.length} faculty, ${rooms.length} rooms, ${batches.length} batches, ${staff.length} staff, ${facultyAvailability.length} availability entries`);

    // Run genetic algorithm with faculty availability
    const ga = new GeneticAlgorithm(courses, faculty, rooms, batches, staff, facultyAvailability, weights, params);
    const result = await ga.evolve();

    console.log(`GA complete: ${result.bestSchedule.length} schedule entries, ${result.conflicts} conflicts, ${result.availabilityViolations} availability violations`);

    // Clear existing schedules if requested
    if (clearExisting && result.bestSchedule.length > 0) {
      console.log('Clearing existing schedules...');
      const { error: deleteError } = await supabase
        .from('schedules')
        .delete()
        .eq('academic_year', academicYear)
        .eq('semester', semester);

      if (deleteError) {
        console.warn('Failed to clear existing schedules:', deleteError.message);
      }
    }

    // Insert new schedules
    if (result.bestSchedule.length > 0) {
      const schedulesToInsert = result.bestSchedule.map(gene => ({
        course_id: gene.courseId,
        faculty_id: gene.facultyId,
        batch_id: gene.batchId,
        room_id: gene.roomId,
        assigned_staff_id: gene.staffId,
        day: gene.timeSlot.day,
        start_time: gene.timeSlot.startTime,
        end_time: gene.timeSlot.endTime,
        type: gene.type,
        academic_year: academicYear,
        semester: semester,
      }));

      console.log(`Inserting ${schedulesToInsert.length} schedule entries...`);

      // Insert in batches to avoid timeout
      const batchSize = 50;
      for (let i = 0; i < schedulesToInsert.length; i += batchSize) {
        const batch = schedulesToInsert.slice(i, i + batchSize);
        const { error: insertError } = await supabase.from('schedules').insert(batch);
        
        if (insertError) {
          console.error(`Insert batch error: ${insertError.message}`);
          throw new Error(`Failed to insert schedules: ${insertError.message}`);
        }
      }

      console.log('Schedules inserted successfully');
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: result.bestSchedule.length > 0 
          ? `Generated ${result.bestSchedule.length} schedule entries with ${result.conflicts} conflicts and ${result.availabilityViolations} faculty availability violations`
          : 'No schedules generated - check if you have courses, faculty, rooms, and batches configured',
        stats: {
          totalEntries: result.bestSchedule.length,
          conflicts: result.conflicts,
          availabilityViolations: result.availabilityViolations,
          fitness: result.bestFitness,
          generations: result.generations,
        },
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in generate-timetable:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
