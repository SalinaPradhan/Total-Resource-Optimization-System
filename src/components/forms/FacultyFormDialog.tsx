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
import { Faculty } from "@/types";
import { facultySchema, parseSubjects, type FacultyFormValues } from "@/lib/validationSchemas";

interface FacultyFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Faculty, "id">) => void;
  faculty?: Faculty | null;
  isSubmitting?: boolean;
}

export function FacultyFormDialog({
  open,
  onOpenChange,
  onSubmit,
  faculty,
  isSubmitting = false,
}: FacultyFormDialogProps) {
  const isEditing = !!faculty;

  const form = useForm<FacultyFormValues>({
    resolver: zodResolver(facultySchema),
    defaultValues: {
      name: "",
      email: "",
      department: "",
      subjects: "",
      maxLoad: 18,
      currentLoad: 0,
      status: "available",
    },
  });

  useEffect(() => {
    if (faculty) {
      form.reset({
        name: faculty.name,
        email: faculty.email,
        department: faculty.department,
        subjects: faculty.subjects.join(", "),
        maxLoad: faculty.maxLoad,
        currentLoad: faculty.currentLoad,
        status: faculty.status,
      });
    } else {
      form.reset({
        name: "",
        email: "",
        department: "",
        subjects: "",
        maxLoad: 18,
        currentLoad: 0,
        status: "available",
      });
    }
  }, [faculty, form, open]);

  const handleSubmit = (data: FacultyFormValues) => {
    const subjects = parseSubjects(data.subjects);

    onSubmit({
      name: data.name.trim(),
      email: data.email.trim(),
      department: data.department.trim(),
      subjects,
      maxLoad: data.maxLoad,
      currentLoad: data.currentLoad,
      status: data.status,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Faculty Member" : "Add New Faculty"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Dr. John Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john.smith@university.edu"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <FormControl>
                    <Input placeholder="Computer Science" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subjects"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subjects (comma-separated)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Data Structures, Algorithms, Database Systems"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="maxLoad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Load (hrs)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currentLoad"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Load</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="on-leave">On Leave</SelectItem>
                        <SelectItem value="busy">Busy</SelectItem>
                      </SelectContent>
                    </Select>
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
                  : "Add Faculty"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
