"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentActions,
  AttachmentAction,
  AttachmentTrigger
} from "@/components/ui/attachment";
import { Loader2, ImageIcon, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCreateLoaneeMutation } from "@/hooks/loan/useCreateLoaneeMutation";
import { uploadLoaneePhoto } from "@/lib/query/upload";

const schema = z.object({
  loaneeNumber: z.coerce
    .number({ invalid_type_error: "Must be a number" })
    .int()
    .positive("Must be a positive number"),
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().optional(),
  photoUrl: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface CreateLoaneeFormProps {
  onSuccess?: () => void;
}

export function CreateLoaneeForm({ onSuccess }: CreateLoaneeFormProps) {
  const createMutation = useCreateLoaneeMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      loaneeNumber: "" as unknown as number,
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      photoUrl: "",
    },
  });

  const [avatarUploadPending, setAvatarUploadPending] = useState(false);
  const [avatarUploadName, setAvatarUploadName] = useState<string | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);

  async function handleAvatarUpload(file: File | null) {
    if (!file) return;

    try {
      setAvatarUploadPending(true);

      const reader = new FileReader();
      reader.onload = (e) => {
        if (typeof e.target?.result === "string") {
          setAvatarPreviewUrl(e.target.result);
        }
      };
      reader.readAsDataURL(file);
      setAvatarUploadName(file.name);

      const upload = await uploadLoaneePhoto(file);
      if (upload.url) {
        form.setValue("photoUrl", upload.url, { shouldDirty: true, shouldValidate: true });
      }
      toast.success("Photo uploaded.");
    } catch (error) {
      setAvatarPreviewUrl(null);
      setAvatarUploadName(null);
      toast.error(error instanceof Error ? error.message : "Unable to upload photo.");
    } finally {
      setAvatarUploadPending(false);
    }
  }

  const onSubmit = (values: FormValues) => {
    createMutation.mutate(
      {
        loaneeNumber: Number(values.loaneeNumber),
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        ...(values.middleName ? { middleName: values.middleName } : {}),
        ...(values.phoneNumber ? { phoneNumber: values.phoneNumber } : {}),
        ...(values.photoUrl ? { photoUrl: values.photoUrl } : {}),
      },
      {
        onSuccess: () => {
          form.reset();
          onSuccess?.();
        },
      },
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
        <h2 className="text-xl font-semibold">Add New Loanee</h2>

        {createMutation.isError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {createMutation.error.message}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="loaneeNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Loanee Number <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g. 1001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  First Name <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="First name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="middleName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Middle Name</FormLabel>
                <FormControl>
                  <Input placeholder="Middle name" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Last Name <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Last name" {...field} />
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
                <FormLabel>
                  Email <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input type="email" placeholder="loanee@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="+234 …" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="photoUrl"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Profile Photo</FormLabel>
                <FormControl>
                  <div>
                    <Attachment
                      state={avatarUploadPending ? "uploading" : field.value ? "done" : "idle"}
                      className="w-full"
                    >
                      <AttachmentMedia variant={avatarPreviewUrl ? "image" : "icon"}>
                        {avatarPreviewUrl ? (
                          <img src={avatarPreviewUrl} alt="Avatar" />
                        ) : (
                          <ImageIcon />
                        )}
                      </AttachmentMedia>
                      <AttachmentContent>
                        <AttachmentTitle>{avatarUploadName || "Upload profile photo"}</AttachmentTitle>
                        <AttachmentDescription>
                          {avatarUploadName
                            ? "Image uploaded successfully."
                            : "Select an image file to upload as the loanee's profile photo."}
                        </AttachmentDescription>
                      </AttachmentContent>

                      {!(field.value || avatarUploadPending) && (
                        <AttachmentTrigger asChild>
                          <label className="cursor-pointer">
                            <span className="sr-only">Upload</span>
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleAvatarUpload(file);
                                e.target.value = "";
                              }}
                            />
                          </label>
                        </AttachmentTrigger>
                      )}

                      {(field.value || avatarUploadPending) && (
                        <AttachmentActions>
                          <AttachmentAction
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              form.setValue("photoUrl", "", { shouldDirty: true, shouldValidate: true });
                              setAvatarUploadName(null);
                              setAvatarPreviewUrl(null);
                            }}
                          >
                            <X />
                          </AttachmentAction>
                        </AttachmentActions>
                      )}
                    </Attachment>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={createMutation.isPending || avatarUploadPending}>
            {(createMutation.isPending || avatarUploadPending) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create Loanee
          </Button>
        </div>
      </form>
    </Form>
  );
}
