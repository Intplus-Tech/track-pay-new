"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { ImageIcon, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { uploadUserAvatar } from "@/lib/query/upload";
import type { UpdateUserPayload, RbacUserDetail, RbacRole, RbacBranch } from "@/types/rbac";
import { useUpdateUserMutation } from "@/hooks/rbac/useUpdateUserMutation";
const updateUserSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  firstName: z.string().optional(),
  middleName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional(),
  password: z
    .string()
    .optional()
    .refine((value) => !value || value.length >= 8, {
      message: "Password must be at least 8 characters",
    }),
  roleId: z.string().min(1, "Role is required").refine((val) => val !== "unassigned", "Role is required"),
  branchId: z.string().min(1, "Branch is required").refine((val) => val !== "unassigned", "Branch is required"),
  photoUploadId: z.string().optional(),
  isActive: z.boolean(),
});
type UpdateUserValues = z.infer<typeof updateUserSchema>;
interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: RbacUserDetail | null;
  roles: RbacRole[];
  branches: RbacBranch[];
}
export function EditUserDialog({ open, onOpenChange, user, roles, branches }: EditUserDialogProps) {
  const updateUserMutation = useUpdateUserMutation();
  const [avatarUploadPending, setAvatarUploadPending] = useState(false);
  const [avatarUploadName, setAvatarUploadName] = useState<string | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const form = useForm<UpdateUserValues>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      email: "",
      firstName: "",
      middleName: "",
      lastName: "",
      phoneNumber: "",
      password: "",
      roleId: "unassigned",
      branchId: "unassigned",
      photoUploadId: "",
      isActive: true,
    },
  });
  useEffect(() => {
    if (!user) {
      return;
    }
    form.reset({
      email: user.email ?? "",
      firstName: user.firstName ?? "",
      middleName: user.middleName ?? "",
      lastName: user.lastName ?? "",
      phoneNumber: user.phoneNumber ?? "",
      password: "",
      roleId: user.roleId ?? "unassigned",
      branchId: user.branchId ?? "unassigned",
      photoUploadId: user.photoUploadId ?? "",
      isActive: user.isActive ?? true,
    });
    setAvatarPreviewUrl(user.photoUrl ?? null);
    setAvatarUploadName(null);
  }, [form, user]);
  async function handleEditAvatarUpload(file: File | null) {
    if (!file) {
      return;
    }
    try {
      setAvatarUploadPending(true);



      // Use FileReader (base64 data URL) to avoid CSP blocking blob: URLs
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
      setAvatarPreviewUrl(null);
      setAvatarUploadName(null);
      toast.error(error instanceof Error ? error.message : "Unable to upload photo.");
    } finally {
      setAvatarUploadPending(false);
    }
  }
  async function onSave(values: UpdateUserValues) {
    if (!user) {
      return;
    }
    const payload: UpdateUserPayload = {
      email: values.email,
      firstName: values.firstName?.trim() || undefined,
      middleName: values.middleName?.trim() || undefined,
      lastName: values.lastName?.trim() || undefined,
      phoneNumber: values.phoneNumber?.trim() || undefined,
      roleId: values.roleId,
      branchId: values.branchId,
      photoUploadId: values.photoUploadId?.trim() || undefined,
      isActive: values.isActive,
    };
    if (values.password && values.password.trim().length > 0) {
      payload.password = values.password;
    }
    try {
      await updateUserMutation.mutateAsync({ id: user.id!, payload });
      toast.success("User updated.");
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update user.");
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(100vw-1rem,56rem)] max-w-none bg-white max-h-[90vh] overflow-hidden overflow-y-scroll">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl><Input type="email" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="firstName" render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="middleName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Middle name</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="lastName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Last name</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone number</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel>New password (optional)</FormLabel>
                  <FormControl><Input type="password" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="roleId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Assign a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white">
                      <SelectItem value="unassigned">No role</SelectItem>
                      {roles.map((roleOption) => (
                        <SelectItem key={roleOption.id} value={roleOption.id}>
                          {roleOption.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="branchId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Branch</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Assign a branch" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white">
                      <SelectItem value="unassigned">No branch</SelectItem>
                      {branches.map((branchOption) => (
                        <SelectItem key={branchOption.id} value={branchOption.id}>
                          {branchOption.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="photoUploadId" render={({ field }) => (
                <FormItem className="md:col-span-2">
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
                              : "Uploads to the backend and updates the stored upload id for this user profile."}
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
                                  if (file) handleEditAvatarUpload(file);
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
              )} />
              <FormField control={form.control} name="isActive" render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-4 md:col-span-2">
                  <div>
                    <FormLabel>Active account</FormLabel>
                    <p className="text-sm text-slate-500">Inactive users remain in the system but should not authenticate.</p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )} />
            </div>
            <div className="flex items-center justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={avatarUploadPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateUserMutation.isPending || avatarUploadPending}>
                {updateUserMutation.isPending ? "Saving..." : "Save profile"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}