"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Client } from "@/types";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  company: z.string().optional(),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  postal: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface ClientFormProps {
  initialData?: Partial<Client>;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function ClientForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}: ClientFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialData?.name || "",
      company: initialData?.company || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      address: initialData?.address || "",
      city: initialData?.city || "",
      province: initialData?.province || "",
      postal: initialData?.postal || "",
      country: initialData?.country || "Canada",
      notes: initialData?.notes || "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Full Name"
          placeholder="John Doe"
          required
          error={errors.name?.message}
          {...register("name")}
        />
        <Input
          label="Company"
          placeholder="Acme Corp"
          error={errors.company?.message}
          {...register("company")}
        />
        <Input
          label="Email"
          type="email"
          placeholder="john@example.com"
          required
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label="Phone"
          type="tel"
          placeholder="+1 (604) 555-0100"
          error={errors.phone?.message}
          {...register("phone")}
        />
      </div>

      <Input
        label="Street Address"
        placeholder="123 Main Street"
        error={errors.address?.message}
        {...register("address")}
      />

      <div className="grid grid-cols-3 gap-4">
        <Input
          label="City"
          placeholder="Vancouver"
          error={errors.city?.message}
          {...register("city")}
        />
        <Input
          label="Province/State"
          placeholder="BC"
          error={errors.province?.message}
          {...register("province")}
        />
        <Input
          label="Postal Code"
          placeholder="V6B 1A1"
          error={errors.postal?.message}
          {...register("postal")}
        />
      </div>

      <Input
        label="Country"
        placeholder="Canada"
        error={errors.country?.message}
        {...register("country")}
      />

      <div>
        <label className="block text-sm font-medium text-brand-textDark mb-1.5">
          Notes
        </label>
        <textarea
          {...register("notes")}
          placeholder="Any additional notes about this client..."
          rows={3}
          className="w-full text-sm border border-brand-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-accent text-brand-textDark placeholder-brand-textMuted resize-none"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={loading} className="flex-1">
          {initialData?.id ? "Save Changes" : "Add Client"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  );
}
