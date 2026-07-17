"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import TableSkeleton from "@/components/TableSkeleton";

type Company = {
  id: number; name: string; industry: string; location: string;
  contactPerson: string; email: string; phone: string;
};

const empty = { name: "", industry: "", location: "", contactPerson: "", email: "", phone: "" };

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Company | null>(null);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchCompanies(q = "") {
    const res = await fetch(`/api/companies?search=${encodeURIComponent(q)}`);
    setCompanies(await res.json());
    setInitialLoading(false);
  }

  useEffect(() => { fetchCompanies(); }, []);

  function openAdd() { setEditTarget(null); setForm(empty); setError(""); setOpen(true); }
  function openEdit(c: Company) {
    setEditTarget(c);
    setForm({ name: c.name, industry: c.industry, location: c.location, contactPerson: c.contactPerson, email: c.email, phone: c.phone });
    setError(""); setOpen(true);
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this company?")) return;
    await fetch(`/api/companies/${id}`, { method: "DELETE" });
    fetchCompanies(search);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const method = editTarget ? "PUT" : "POST";
    const url = editTarget ? `/api/companies/${editTarget.id}` : "/api/companies";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setLoading(false);
    if (!res.ok) { const d = await res.json(); setError(d.error || "Error"); return; }
    setOpen(false); fetchCompanies(search);
  }

  const fields: [string, keyof typeof empty, string][] = [
    ["Company Name", "name", "TechCorp Pvt. Ltd."],
    ["Industry", "industry", "IT, Finance, etc."],
    ["Location", "location", "Patna, Bihar"],
    ["Contact Person", "contactPerson", "Rahul Sharma"],
    ["Email", "email", "hr@company.com"],
    ["Phone", "phone", "9001234567"],
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Companies</h1>
          <p className="text-muted-foreground text-sm">Manage company and placement records</p>
        </div>
        <Button onClick={openAdd}><Plus className="w-4 h-4 mr-2" />Add Company</Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by company name..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); fetchCompanies(e.target.value); }}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Industry</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            {initialLoading ? <TableSkeleton cols={7} /> : <TableBody>
              {companies.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground">{c.industry}</TableCell>
                  <TableCell className="text-muted-foreground">{c.location}</TableCell>
                  <TableCell className="text-muted-foreground">{c.contactPerson}</TableCell>
                  <TableCell className="text-muted-foreground">{c.email}</TableCell>
                  <TableCell className="text-muted-foreground">{c.phone}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(c.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {companies.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-10">No companies found.</TableCell>
                </TableRow>
              )}
            </TableBody>}
          </Table>
        </CardContent>
      </Card>

      <Drawer open={open} onOpenChange={setOpen} swipeDirection="right">
        <DrawerContent className="sm:[--drawer-content-width:600px]">
          <DrawerHeader>
            <DrawerTitle>{editTarget ? "Edit Company" : "Add Company"}</DrawerTitle>
          </DrawerHeader>
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-4 space-y-4 py-2">
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="grid grid-cols-2 gap-3">
                {fields.map(([label, key, placeholder]) => (
                  <div key={key} className={key === "name" ? "col-span-2 space-y-1.5" : "space-y-1.5"}>
                    <Label>{label}</Label>
                    <Input
                      required
                      placeholder={placeholder}
                      value={form[key]}
                      onChange={e => setForm({ ...form, [key]: e.target.value })}
                    />
                  </div>
                ))}
              </div>
            </div>
            <DrawerFooter>
              <Button type="submit" disabled={loading}>{loading ? "Saving..." : editTarget ? "Update Company" : "Add Company"}</Button>
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
