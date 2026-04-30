import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Batch } from "@/types";
import { batchSchema, DISCIPLINES, type BatchFormValues } from "@/lib/validationSchemas";

const currentYear = new Date().getFullYear();

interface BatchFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Batch, "id">) => void;
  batch?: Batch | null;
  isSubmitting?: boolean;
}

export function BatchFormDialog({
  open,
  onOpenChange,
  onSubmit,
  batch,
  isSubmitting = false,
}: BatchFormDialogProps) {
  const isEditing = !!batch;

  const form = useForm<BatchFormValues>({
    resolver: zodResolver(batchSchema),
    defaultValues: {
      name: "",
      discipline: "B.Tech",
      branch: "",
      subBranch: "",
      section: "A",
      semester: 1,
      size: 40,
      year: currentYear,
      classStartTime: "",
      classEndTime: "",
    },
  });

  useEffect(() => {
    if (batch) {
      form.reset({
        name: batch.name,
        discipline: batch.discipline as typeof DISCIPLINES[number],
        branch: batch.branch,
        subBranch: batch.subBranch ?? "",
        section: batch.section,
        semester: batch.semester,
        size: batch.size,
        year: batch.year,
        classStartTime: batch.classStartTime ?? "",
        classEndTime: batch.classEndTime ?? "",
      });
    } else {
      form.reset({
        name: "",
        discipline: "B.Tech",
        branch: "",
        subBranch: "",
        section: "A",
        semester: 1,
        size: 40,
        year: currentYear,
        classStartTime: "",
        classEndTime: "",
      });
    }
  }, [batch, form, open]);

  const handleSubmit = (data: BatchFormValues) => {
    onSubmit({
      name: data.name.trim(),
      discipline: data.discipline,
      branch: data.branch.trim(),
      subBranch: data.subBranch?.trim() || undefined,
      section: data.section.trim(),
      semester: data.semester,
      size: data.size,
      year: data.year,
      classStartTime: data.classStartTime || undefined,
      classEndTime: data.classEndTime || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Batch" : "Add New Batch"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Discipline & Branch */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="discipline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discipline</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select discipline" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {DISCIPLINES.map((d) => (
                          <SelectItem key={d} value={d}>{d}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="branch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch</FormLabel>
                    <FormControl>
                      <Input placeholder="Computer Science" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Sub-branch & Batch Name */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="subBranch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sub-branch (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="AI/ML, Data Science..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batch Name</FormLabel>
                    <FormControl>
                      <Input placeholder="CS-2024-A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Section, Semester, Year */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="section"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section</FormLabel>
                    <FormControl>
                      <Input placeholder="A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="semester"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Semester</FormLabel>
                    <Select
                      onValueChange={(val) => field.onChange(parseInt(val))}
                      value={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                          <SelectItem key={sem} value={sem.toString()}>
                            Semester {sem}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Academic Year</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Size & Class Timings */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student Capacity</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="classStartTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="classEndTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : isEditing
                  ? "Save Changes"
                  : "Add Batch"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
