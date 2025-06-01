"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, CheckCircle } from "lucide-react";

export function BulkUpload() {
  const [uploadState, setUploadState] = useState<
    "initial" | "uploading" | "success"
  >("initial");
  const [file, setFile] = useState<File | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadState("uploading");
      // Simulate upload progress
      setTimeout(() => {
        setUploadState("success");
      }, 2000);
    }
  };

  const handleSubmit = () => {
    if (uploadState === "success") {
      // Handle successful upload
      setUploadState("initial");
      setFile(null);
    }
  };

  return (
    <div>
      {uploadState === "success" ? (
        <div className="text-center space-y-4 py-8">
          <div className="flex justify-center">
            <CheckCircle className="h-16 w-16 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">Successful!</h3>
          <p className="text-sm text-muted-foreground">
            11,200 Account created
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center space-y-4">
            <div className="flex justify-center">
              <Upload className="h-12 w-12 text-gray-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Drag your document here, or{" "}
                <label
                  htmlFor="file-upload"
                  className="text-blue-600 hover:underline cursor-pointer"
                >
                  browse
                </label>
              </p>
              <p className="text-xs text-muted-foreground">
                Supports: PDF, XLS, XLSX
              </p>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                accept=".pdf,.xls,.xlsx"
                onChange={handleFileUpload}
              />
            </div>
          </div>

          {uploadState === "uploading" && file && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-red-600">📄</span>
                <span>{file.name}</span>
                <span className="text-green-600">✓</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-400 h-2 rounded-full"
                  style={{ width: "75%" }}
                ></div>
              </div>
            </div>
          )}

          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={uploadState !== "uploading"}
          >
            Submit
          </Button>
        </div>
      )}
    </div>
  );
}
