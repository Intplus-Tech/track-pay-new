"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCreateUserMutation } from "@/hooks/rbac/useCreateUserMutation";
import { RBAC_MODULE_OPTIONS } from "@/lib/rbac";
import { uploadUserAvatar } from "@/lib/query/upload";
import type { CreateUserPayload, RbacModuleName, RbacModulePermission, RbacRole, RbacBranch } from "@/types/rbac";

const createUserSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Enter a valid email address"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  roleId: z.string().min(1, "Role is required").refine((val) => val !== "unassigned", "Role is required"),
  branchId: z.string().min(1, "Branch is required").refine((val) => val !== "unassigned", "Branch is required"),
  maxAssignedLoans: z.string().optional().refine((value) => !value || Number.isFinite(Number(value)), {
    message: "Max assigned loans must be a valid number",
  }),
  monthlyCollectionTarget: z.string().optional().refine((value) => !value || /^\d+(\.\d{1,2})?$/.test(value), {
    message: "Monthly target must be a valid amount",
  }),
  photoUploadId: z.string().optional(),
  isActive: z.boolean(),
});

type CreateUserValues = z.infer<typeof createUserSchema>;
type PermissionGrid = Record<RbacModuleName, { view: boolean; manage: boolean }>;

function createEmptyPermissionGrid(): PermissionGrid {
  return RBAC_MODULE_OPTIONS.reduce((grid, option) => {
    grid[option.module] = { view: false, manage: false };
    return grid;
  }, {} as PermissionGrid);
}

function serializePermissionGrid(grid: PermissionGrid): RbacModulePermission[] {
  return RBAC_MODULE_OPTIONS.flatMap((option) => {
    const permission = grid[option.module];

    if (!permission.view && !permission.manage) {
      return [];
    }

    return [
      {
        module: option.module,
        view: permission.view || permission.manage,
        manage: permission.manage,
      },
    ];
  });
}

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roles: RbacRole[];
  branches: RbacBranch[];
}

export function CreateUserDialog({ open, onOpenChange, roles, branches }: CreateUserDialogProps) {
  const [avatarUploadPending, setAvatarUploadPending] = useState(false);
  const [avatarUploadName, setAvatarUploadName] = useState<string | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [moduleOverridesEnabled, setModuleOverridesEnabled] = useState(false);
  const [createPermissionGridState, setCreatePermissionGridState] = useState<PermissionGrid>(() => createEmptyPermissionGrid());

  const createUserMutation = useCreateUserMutation();

  const form = useForm<CreateUserValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
      roleId: "unassigned",
      branchId: "unassigned",
      maxAssignedLoans: "",
      monthlyCollectionTarget: "",
      photoUploadId: "",
      isActive: true,
    },
  });

  const selectedRoleId = form.watch("roleId");
  const selectedRole = roles.find((role) => role.id === selectedRoleId) ?? null;
  const isLoanOfficerRole = selectedRole
    ? selectedRole.name.replace(/\s+/g, "_").toUpperCase().includes("LOAN_OFFICER")
    : false;

  function resetCreateDialog() {
    form.reset({
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
      roleId: "unassigned",
      branchId: "unassigned",
      maxAssignedLoans: "",
      monthlyCollectionTarget: "",
      photoUploadId: "",
      isActive: true,
    });
    setAvatarUploadPending(false);
    setAvatarUploadName(null);
    setAvatarPreviewUrl(null);
    setModuleOverridesEnabled(false);
    setCreatePermissionGridState(createEmptyPermissionGrid());
  }

  async function handleCreateAvatarUpload(file: File | null) {
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

  function updateCreatePermissionValue(
    module: RbacModuleName,
    field: "view" | "manage",
    checked: boolean,
  ) {
    setCreatePermissionGridState((current) => {
      const next = {
        ...current,
        [module]: {
          ...current[module],
        },
      };

      if (field === "manage") {
        next[module] = {
          view: checked ? true : next[module].view,
          manage: checked,
        };
      } else {
        next[module] = {
          view: checked,
          manage: checked ? next[module].manage : false,
        };
      }

      if (!next[module].view) {
        next[module].manage = false;
      }

      return next;
    });
  }

  async function onSubmit(values: CreateUserValues) {
    try {
      const payload: CreateUserPayload = {
        firstName: values.firstName.trim(),
        middleName: values.middleName?.trim() || undefined,
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        phoneNumber: values.phoneNumber.trim(),
        password: values.password,
        roleId: values.roleId,
        branchId: values.branchId,
        maxAssignedLoans: values.maxAssignedLoans?.trim() ? Number(values.maxAssignedLoans) : undefined,
        monthlyCollectionTarget: values.monthlyCollectionTarget?.trim() || undefined,
        photoUploadId: values.photoUploadId?.trim() || undefined,
        modulePermissions: moduleOverridesEnabled ? serializePermissionGrid(createPermissionGridState) : undefined,
        isActive: values.isActive,
      };

      await createUserMutation.mutateAsync(payload);
      toast.success("User created.");
      resetCreateDialog();
      onOpenChange(false);
    } catch (error) {

      toast.error(error instanceof Error ? error.message : "Unable to create user.");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) {
          resetCreateDialog();
        }
      }}
    >
      <DialogContent className="min-w-[50vw] max-h-[96vh]">
        <DialogHeader>
          <DialogTitle>Create user</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="max-h-[65vh] space-y-6 overflow-y-auto pr-1">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Identity</p>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <FormField control={form.control} name="firstName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>First name</FormLabel>
                      <FormControl>
                        <Input placeholder="Amina" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="middleName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Middle name</FormLabel>
                      <FormControl>
                        <Input placeholder="Optional" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="lastName" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last name</FormLabel>
                      <FormControl>
                        <Input placeholder="Yusuf" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="amina@trackpay.io" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone number</FormLabel>
                      <FormControl>
                        <Input placeholder="+2348012345678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Temporary password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Minimum 8 characters" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="roleId" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Assign a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white">
                          <SelectItem value="unassigned">No role</SelectItem>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.name}
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
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Assign a branch" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white">
                          <SelectItem value="unassigned">No branch</SelectItem>
                          {branches.map((branch) => (
                            <SelectItem key={branch.id} value={branch.id}>
                              {branch.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Access and assignment</p>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 p-10">

                  <FormField control={form.control} name="photoUploadId" render={({ field }) => (
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
                                  : "Uploads to the backend and stores the returned upload id automatically."}
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
                                      if (file) handleCreateAvatarUpload(file);
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
                    <FormItem className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 md:col-span-2 xl:col-span-3">
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
              </div>

              {isLoanOfficerRole ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Capacity targets</p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField control={form.control} name="maxAssignedLoans" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max assigned loans</FormLabel>
                        <FormControl>
                          <Input inputMode="numeric" placeholder="75" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="monthlyCollectionTarget" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly collection target</FormLabel>
                        <FormControl>
                          <Input inputMode="decimal" placeholder="300000.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                </div>
              ) : null}

              <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Direct module permissions</p>
                    <p className="text-sm text-slate-500">Leave this off to inherit permissions from the selected role. Enable it only when this specific user needs exceptions beyond role-based access.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-600">Enable overrides</span>
                    <Switch checked={moduleOverridesEnabled} onCheckedChange={setModuleOverridesEnabled} />
                  </div>
                </div>

                {moduleOverridesEnabled ? (
                  <div className="grid gap-4 lg:grid-cols-2">
                    {RBAC_MODULE_OPTIONS.map((option) => {
                      const current = createPermissionGridState[option.module];

                      return (
                        <div key={option.module} className="rounded-2xl border border-slate-200 bg-white p-4">
                          <div className="space-y-1">
                            <p className="font-semibold text-slate-900">{option.label}</p>
                            <p className="text-sm text-slate-500">{option.description}</p>
                          </div>
                          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <label className="flex min-w-[8.5rem] items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
                              <Switch
                                checked={current.view}
                                onCheckedChange={(checked) => updateCreatePermissionValue(option.module, "view", checked)}
                              />
                              <span className="whitespace-nowrap text-sm font-medium text-slate-700">View</span>
                            </label>
                            <label className="flex min-w-[8.5rem] items-center gap-2 rounded-xl border border-slate-200 px-3 py-2">
                              <Switch
                                checked={current.manage}
                                onCheckedChange={(checked) => updateCreatePermissionValue(option.module, "manage", checked)}
                              />
                              <span className="whitespace-nowrap text-sm font-medium text-slate-700">Manage</span>
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createUserMutation.isPending}>
                {createUserMutation.isPending ? "Creating..." : "Create user"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
