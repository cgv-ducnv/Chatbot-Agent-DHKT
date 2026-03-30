"use client";

import { DocumentsDashboard } from "@/features/documents/components/documents-dashboard";
import { ProtectedRoute } from "@/components/protected-route";
import { PERMISSIONS } from "@/constants/permission";

export default function DocumentsPage() {
  return (
    <ProtectedRoute requiredPermissions={[PERMISSIONS.VIEW_SOURCES]}>
      <DocumentsDashboard paramSource="url" />
    </ProtectedRoute>
  );
}
