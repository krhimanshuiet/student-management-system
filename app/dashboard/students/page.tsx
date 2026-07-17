"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Pencil, Trash2, Eye } from "lucide-react";
import TableSkeleton from "@/components/TableSkeleton";

type Student = {
  id: number; rollNo: string; name: string; email: string;
  phone: string; course: string; year: number;
};

const emptyForm = { rollNo: "", name: "", email: "", phone: "", address: "", course: "", year: "1" };

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Student | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function fetchStudents(q = "") {
    const res = await fetch(`/api/students?search=${encodeURIComponent(q)}`);
    setStudents(await res.json());
    setInitialLoading(false);
  }

  useEffect(() => { fetchStudents(); }, []);

  function openAdd() { setEditTarget(null); setForm(emptyForm); setError(""); setOpen(true); }
  function openEdit(s: Student) {
    setEditTarget(s);
    setForm({ rollNo: s.rollNo, name: s.name, email: s.email, phone: s.phone, address: "", course: s.course, year: String(s.year) });
    setError(""); setOpen(true);
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this student?")) return;
    await fetch(`/api/students/${id}`, { method: "DELETE" });
    fetchStudents(search);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const method = editTarget ? "PUT" : "POST";
    const url = editTarget ? `/api/students/${editTarget.id}` : "/api/students";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setLoading(false);
    if (!res.ok) { const d = await res.json(); setError(d.error || "Something went wrong"); return; }
    setOpen(false); fetchStudents(search);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Students</h1>
          <p className="text-muted-foreground text-sm">Manage all student records</p>
        </div>
        <Button onClick={openAdd}><Plus className="w-4 h-4 mr-2" />Add Student</Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or roll no..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); fetchStudents(e.target.value); }}
              className="pl-8"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Roll No.</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Year</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            {initialLoading ? <TableSkeleton cols={7} /> : <TableBody>
              {students.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium text-primary">{s.rollNo}</TableCell>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="text-muted-foreground">{s.email}</TableCell>
                  <TableCell className="text-muted-foreground">{s.phone}</TableCell>
                  <TableCell><Badge variant="secondary">{s.course}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">Year {s.year}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/dashboard/students/${s.id}`}><Eye className="w-4 h-4" /></Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(s)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {students.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                    No students found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>}
          </Table>
        </CardContent>
      </Card>

      <Drawer open={open} onOpenChange={setOpen} swipeDirection="right">
        <DrawerContent className="sm:[--drawer-content-width:600px]">
          <DrawerHeader>
            <DrawerTitle>{editTarget ? "Edit Student" : "Add Student"}</DrawerTitle>
          </DrawerHeader>
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-4 space-y-4 py-2">
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Roll No.</Label>
                  <Input required value={form.rollNo} onChange={e => setForm({ ...form, rollNo: e.target.value })} placeholder="BCA001" />
                </div>
                <div className="space-y-1.5">
                  <Label>Full Name</Label>
                  <Input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Student name" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="student@example.com" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="9876543210" />
                </div>
                <div className="space-y-1.5">
                  <Label>Course</Label>
                  <Input required value={form.course} onChange={e => setForm({ ...form, course: e.target.value })} placeholder="BCA" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Address</Label>
                  <Input required value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="City, State" />
                </div>
                <div className="space-y-1.5">
                  <Label>Year</Label>
                  <Select value={form.year} onValueChange={v => setForm({ ...form, year: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Year 1</SelectItem>
                      <SelectItem value="2">Year 2</SelectItem>
                      <SelectItem value="3">Year 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DrawerFooter>
              <Button type="submit" disabled={loading}>{loading ? "Saving..." : editTarget ? "Update Student" : "Add Student"}</Button>
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
