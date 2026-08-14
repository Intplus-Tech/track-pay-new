"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
  AttachmentActions,
  AttachmentAction,
  AttachmentTrigger,
} from "@/components/ui/attachment";
import { ImageIcon, X } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useUpdateUserMutation } from "@/hooks/rbac/useUpdateUserMutation";
import { uploadUserAvatar } from "@/lib/query/upload";
import { Edit2 } from "lucide-react";
import { useRouter } from "next/navigation";

const editProfileSchema = z.object({
  firstName: z.string().optional(),
  middleName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional(),
  photoUploadId: z.string().optional(),
});

type EditProfileValues = z.infer<typeof editProfileSchema>;

export function EditProfileModal({ profile }: { profile: any }) {
  const [open, setOpen] = useState(false);
  const updateUserMutation = useUpdateUserMutation();
  const router = useRouter();
  const [avatarUploadPending, setAvatarUploadPending] = useState(false);
  const [avatarUploadName, setAvatarUploadName] = useState<string | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(profile.photoUrl ?? null);

  const form = useForm<EditProfileValues>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      firstName: profile.firstName || "",
      middleName: profile.middleName || "",
      lastName: profile.lastName || "",
      phoneNumber: profile.phoneNumber || "",
      photoUploadId: profile.photoUploadId || "",
    },
  });

  async function handleAvatarUpload(file: File | null) {
    if (!file) {
      return;
    }

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

      const upload = await uploadUserAvatar(file);

      form.setValue("photoUploadId", upload.uploadId, { shouldDirty: true, shouldValidate: true });
      toast.success("Photo uploaded.");
    } catch (error) {
      setAvatarPreviewUrl(profile.photoUrl ?? null);
      setAvatarUploadName(null);
      toast.error(error instanceof Error ? error.message : "Unable to upload photo.");
    } finally {
      setAvatarUploadPending(false);
    }
  }

  async function onSave(values: EditProfileValues) {
    try {
      await updateUserMutation.mutateAsync({
        id: profile._id || profile.id,
        payload: {
          firstName: values.firstName?.trim() || undefined,
          middleName: values.middleName?.trim() || undefined,
          lastName: values.lastName?.trim() || undefined,
          phoneNumber: values.phoneNumber?.trim() || undefined,
          photoUploadId: values.photoUploadId?.trim() || undefined,
        },
      });
      toast.success("Profile updated successfully.");
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update profile.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto bg-white hover:bg-slate-50">
          <Edit2 className="w-4 h-4 mr-2" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>Edit Personal Information</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="photoUploadId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile photo</FormLabel>
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
                          <AttachmentTitle>{avatarUploadName || "Upload avatar image"}</AttachmentTitle>
                          <AttachmentDescription>
                            {avatarUploadName
                              ? "Image uploaded successfully."
                              : "Uploads to the backend and updates your stored profile photo."}
                          </AttachmentDescription>
                        </AttachmentContent>

                        {!avatarUploadPending && (
                          <AttachmentTrigger asChild>
                            <label className="cursor-pointer">
                              <span className="sr-only">
                                {field.value || avatarPreviewUrl ? "Replace avatar image" : "Upload avatar image"}
                              </span>
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

                        {(field.value || avatarPreviewUrl || avatarUploadPending) && (
                          <AttachmentActions>
                            <AttachmentAction
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                form.setValue("photoUploadId", "", { shouldDirty: true, shouldValidate: true });
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
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter first name" {...field} />
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
                    <Input placeholder="Enter middle name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter last name" {...field} />
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
                    <Input placeholder="Enter phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end pt-4 gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={avatarUploadPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateUserMutation.isPending || avatarUploadPending}>
                {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
