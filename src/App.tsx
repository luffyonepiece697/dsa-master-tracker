/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { auth, signIn, logOut, db } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  LayoutDashboard, 
  BookOpen, 
  PlusCircle, 
  Upload, 
  FileText,
  LogOut, 
  LogIn,
  CheckCircle2,
  Circle,
  ExternalLink,
  ChevronRight,
  Search,
  Code2,
  BrainCircuit,
  Clock,
  Database,
  Loader2,
  Pencil,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Toaster, toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';

// Types
interface Sheet {
  id: string;
  name: string;
  description: string;
  createdAt: any;
}

interface Problem {
  id: string;
  sheetId: string;
  title: string;
  link: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  status: 'Solved' | 'Unsolved';
}

interface Solution {
  id: string;
  problemId: string;
  code: string;
  approach: string;
  tc: string;
  sc: string;
  type: 'Brute Force' | 'Better' | 'Optimal';
  createdAt: any;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<Sheet | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [view, setView] = useState<'dashboard' | 'sheet' | 'problem'>('dashboard');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'sheets'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Sheet));
      setSheets(data);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!selectedSheet) return;
    const q = query(collection(db, 'problems'), where('sheetId', '==', selectedSheet.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Problem));
      setProblems(data);
    });
    return () => unsubscribe();
  }, [selectedSheet]);

  useEffect(() => {
    if (!selectedProblem) return;
    const q = query(collection(db, 'solutions'), where('problemId', '==', selectedProblem.id), orderBy('createdAt', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Solution));
      setSolutions(data);
    });
    return () => unsubscribe();
  }, [selectedProblem]);

  const handleSignIn = async () => {
    try {
      await signIn();
      toast.success('Signed in successfully');
    } catch (error) {
      toast.error('Failed to sign in');
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Failed to sign out');
    }
  };

  const addSheet = async (name: string, description: string) => {
    try {
      await addDoc(collection(db, 'sheets'), {
        name,
        description,
        createdAt: serverTimestamp()
      });
      toast.success('Sheet added');
    } catch (error) {
      toast.error('Failed to add sheet');
    }
  };

  const toggleProblemStatus = async (problem: Problem) => {
    try {
      const newStatus = problem.status === 'Solved' ? 'Unsolved' : 'Solved';
      await updateDoc(doc(db, 'problems', problem.id), {
        status: newStatus
      });
      toast.success(`Problem marked as ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#0a0a0a]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-white p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center space-y-8"
        >
          <div className="space-y-2">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <BrainCircuit className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">DSA Mastery</h1>
            <p className="text-muted-foreground">Track your progress, store solutions, and master algorithms.</p>
          </div>
          <Button onClick={handleSignIn} size="lg" className="w-full gap-2">
            <LogIn className="w-4 h-4" />
            Sign in with Google
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-primary/30">
      <Toaster position="top-center" theme="dark" />
      
      {/* Sidebar / Navigation */}
      <div className="fixed left-0 top-0 bottom-0 w-64 border-r border-zinc-800 bg-[#0d0d0d] hidden md:flex flex-col">
        <div className="p-6 flex items-center gap-3 border-bottom border-zinc-800">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-black" />
          </div>
          <span className="font-bold text-lg tracking-tight">DSA Tracker</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Button 
            variant={view === 'dashboard' ? 'secondary' : 'ghost'} 
            className="w-full justify-start gap-3"
            onClick={() => {
              setView('dashboard');
              setSelectedSheet(null);
            }}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </Button>
          <div className="pt-4 pb-2 px-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Your Sheets
          </div>
          <div className="space-y-1 overflow-y-auto max-h-[50vh]">
            {sheets.map(sheet => (
              <Button 
                key={sheet.id}
                variant={selectedSheet?.id === sheet.id ? 'secondary' : 'ghost'} 
                className="w-full justify-start gap-3 text-sm truncate"
                onClick={() => {
                  setSelectedSheet(sheet);
                  setView('sheet');
                }}
              >
                <BookOpen className="w-4 h-4" />
                {sheet.name}
              </Button>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-zinc-800 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <img src={user.photoURL || ''} className="w-8 h-8 rounded-full" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.displayName}</p>
              <p className="text-xs text-zinc-500 truncate">{user.email}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full gap-2 border-zinc-800 hover:bg-zinc-800 text-zinc-100" onClick={handleSignOut}>
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main className="md:ml-64 p-8">
        <AnimatePresence mode="wait">
          {view === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                  <p className="text-zinc-500">Welcome back! Here's your DSA progress.</p>
                </div>
                <div className="flex gap-3">
                  <AddSheetDialog onAdd={addSheet} />
                  <UploadPDFDialog onUpload={async (data) => {
                    try {
                      console.log('Starting PDF import for:', data.name);
                      const sheetRef = await addDoc(collection(db, 'sheets'), {
                        name: data.name.substring(0, 450) || 'Imported Sheet',
                        description: data.description || `Imported from PDF`,
                        createdAt: serverTimestamp()
                      });
                      
                      console.log('Created sheet with ID:', sheetRef.id);
                      
                      // Batch problems to avoid UI lag
                      const batchSize = 20;
                      let importedCount = 0;
                      for (let i = 0; i < data.problems.length; i += batchSize) {
                        const batch = data.problems.slice(i, i + batchSize);
                        await Promise.all(batch.map(async (prob) => {
                          if (!prob.title || !prob.link) return;
                          
                          await addDoc(collection(db, 'problems'), {
                            sheetId: sheetRef.id,
                            title: prob.title,
                            link: prob.link.startsWith('http') ? prob.link : `https://leetcode.com${prob.link}`,
                            difficulty: prob.difficulty || 'Medium',
                            status: 'Unsolved'
                          });
                          importedCount++;
                        }));
                      }
                      toast.success(`Imported ${importedCount} problems for ${data.name}`);
                    } catch (e) {
                      console.error('Firestore Import Error:', e);
                      toast.error('Failed to import PDF data. Check console for details.');
                    }
                  }} />
                  <UploadSheetDialog onUpload={async (data) => {
                    try {
                      const sheetRef = await addDoc(collection(db, 'sheets'), {
                        name: data.name,
                        description: data.description || 'Imported sheet',
                        createdAt: serverTimestamp()
                      });
                      
                      for (const prob of data.problems) {
                        await addDoc(collection(db, 'problems'), {
                          sheetId: sheetRef.id,
                          title: prob.title,
                          link: prob.link || '',
                          difficulty: prob.difficulty || 'Medium',
                          status: 'Unsolved'
                        });
                      }
                      toast.success('Sheet imported successfully');
                    } catch (e) {
                      toast.error('Failed to import sheet');
                    }
                  }} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sheets.map(sheet => (
                  <Card 
                    key={sheet.id} 
                    className="bg-[#141414] border-zinc-800 hover:border-primary/50 transition-colors cursor-pointer group"
                    onClick={() => {
                      setSelectedSheet(sheet);
                      setView('sheet');
                    }}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl text-white group-hover:text-primary transition-colors flex-1 mr-2">{sheet.name}</CardTitle>
                        <div className="flex items-center gap-2">
                          <EditSheetDialog sheet={sheet} />
                          <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                      <CardDescription className="text-zinc-500 line-clamp-2">{sheet.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-zinc-400">
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          <span>Problems</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{new Date(sheet.createdAt?.seconds * 1000).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {view === 'sheet' && selectedSheet && (
            <motion.div 
              key="sheet"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => setView('dashboard')}>
                  Dashboard
                </Button>
                <ChevronRight className="w-4 h-4 text-zinc-600" />
                <h2 className="text-3xl font-bold tracking-tight">{selectedSheet.name}</h2>
              </div>

              <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <Input 
                    placeholder="Search problems..." 
                    className="pl-10 bg-[#141414] border-zinc-800"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <AddProblemDialog sheetId={selectedSheet.id} />
                </div>
              </div>

              <div className="bg-[#141414] border border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-900/50 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      <th className="px-6 py-4 w-12">Status</th>
                      <th className="px-6 py-4">Problem</th>
                      <th className="px-6 py-4 w-32">Difficulty</th>
                      <th className="px-6 py-4 w-32">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {problems
                      .filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map(problem => (
                      <tr key={problem.id} className="hover:bg-zinc-900/30 transition-colors group">
                        <td className="px-6 py-4">
                          <button onClick={() => toggleProblemStatus(problem)}>
                            {problem.status === 'Solved' ? (
                              <CheckCircle2 className="w-5 h-5 text-green-500" />
                            ) : (
                              <Circle className="w-5 h-5 text-zinc-600" />
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-zinc-100">{problem.title}</span>
                            {problem.link && (
                              <a 
                                href={problem.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                              >
                                View on Platform <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant="outline" className={
                            problem.difficulty === 'Easy' ? 'border-green-500/50 text-green-500' :
                            problem.difficulty === 'Medium' ? 'border-yellow-500/50 text-yellow-500' :
                            'border-red-500/50 text-red-500'
                          }>
                            {problem.difficulty}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-primary font-semibold hover:text-primary hover:bg-primary/10"
                              onClick={() => {
                                setSelectedProblem(problem);
                                setView('problem');
                              }}
                            >
                              {problem.status === 'Solved' ? 'View Solution' : 'Solve'}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon-sm" 
                              className="text-zinc-600 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={async () => {
                                if (window.confirm('Delete this problem?')) {
                                  try {
                                    await deleteDoc(doc(db, 'problems', problem.id));
                                    toast.success('Problem deleted');
                                  } catch (e) {
                                    toast.error('Failed to delete problem');
                                  }
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {view === 'problem' && selectedProblem && (
            <motion.div 
              key="problem"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => setView('sheet')}>
                  Back to Sheet
                </Button>
                <ChevronRight className="w-4 h-4 text-zinc-600" />
                <h2 className="text-3xl font-bold tracking-tight">{selectedProblem.title}</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      <Code2 className="w-5 h-5 text-primary" />
                      Solutions
                    </h3>
                    <AddSolutionDialog problemId={selectedProblem.id} onAdd={() => {
                      if (selectedProblem.status === 'Unsolved') {
                        toggleProblemStatus(selectedProblem);
                      }
                    }} />
                  </div>

                  <div className="space-y-6">
                    {solutions.length === 0 ? (
                      <Card className="bg-[#141414] border-zinc-800 border-dashed">
                        <CardContent className="py-12 text-center space-y-4">
                          <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mx-auto">
                            <Code2 className="w-6 h-6 text-zinc-600" />
                          </div>
                          <div className="space-y-1">
                            <p className="font-medium text-zinc-300">No solutions yet</p>
                            <p className="text-sm text-zinc-500">Add your implementation to track your progress.</p>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      solutions.map(sol => (
                        <Card key={sol.id} className="bg-[#141414] border-zinc-800 overflow-hidden">
                          <CardHeader className="bg-zinc-900/50 border-b border-zinc-800">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-3">
                                <Badge variant="secondary">{sol.type}</Badge>
                                <div className="flex items-center gap-4 text-xs text-zinc-500">
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>TC: {sol.tc}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Database className="w-3 h-3" />
                                    <span>SC: {sol.sc}</span>
                                  </div>
                                </div>
                              </div>
                              <span className="text-[10px] text-zinc-600 uppercase tracking-widest">
                                {new Date(sol.createdAt?.seconds * 1000).toLocaleDateString()}
                              </span>
                            </div>
                          </CardHeader>
                          <CardContent className="p-0">
                            <div className="p-6 space-y-4">
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Approach</h4>
                                <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                                  {sol.approach}
                                </div>
                              </div>
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Code</h4>
                                <pre className="bg-black/50 p-4 rounded-lg overflow-x-auto text-xs font-mono text-zinc-300 border border-zinc-800">
                                  <code>{sol.code}</code>
                                </pre>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <Card className="bg-[#141414] border-zinc-800 sticky top-8">
                    <CardHeader>
                      <CardTitle className="text-lg">Problem Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-1">
                        <p className="text-xs text-zinc-500 uppercase tracking-wider">Status</p>
                        <div className="flex items-center gap-2">
                          {selectedProblem.status === 'Solved' ? (
                            <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Solved</Badge>
                          ) : (
                            <Badge variant="outline" className="text-zinc-500 border-zinc-800">Unsolved</Badge>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-zinc-500 uppercase tracking-wider">Difficulty</p>
                        <Badge variant="outline" className={
                          selectedProblem.difficulty === 'Easy' ? 'border-green-500/50 text-green-500' :
                          selectedProblem.difficulty === 'Medium' ? 'border-yellow-500/50 text-yellow-500' :
                          'border-red-500/50 text-red-500'
                        }>
                          {selectedProblem.difficulty}
                        </Badge>
                      </div>
                      {selectedProblem.link && (
                        <Button variant="outline" className="w-full gap-2 border-zinc-800">
                          <a href={selectedProblem.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                            Open Problem <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// Dialog Components
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function AddSheetDialog({ onAdd }: { onAdd: (name: string, desc: string) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-2" />}>
        <PlusCircle className="w-4 h-4" />
        Add Sheet
      </DialogTrigger>
      <DialogContent className="bg-[#141414] border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle>Create New DSA Sheet</DialogTitle>
          <DialogDescription className="text-zinc-500">
            Organize your problems by adding a new sheet.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Sheet Name</label>
            <Input 
              placeholder="e.g. Striver's SDE Sheet" 
              className="bg-zinc-900 border-zinc-800"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea 
              placeholder="What is this sheet about?" 
              className="bg-zinc-900 border-zinc-800"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} className="border-zinc-800 text-zinc-100">Cancel</Button>
          <Button onClick={() => {
            onAdd(name, desc);
            setOpen(false);
            setName('');
            setDesc('');
          }}>Create Sheet</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EditSheetDialog({ sheet }: { sheet: Sheet }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(sheet.name);
  const [desc, setDesc] = useState(sheet.description);

  const handleUpdate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await updateDoc(doc(db, 'sheets', sheet.id), {
        name,
        description: desc
      });
      toast.success('Sheet updated');
      setOpen(false);
    } catch (e) {
      toast.error('Failed to update sheet');
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this sheet? All problems inside will be lost.')) return;
    
    try {
      await deleteDoc(doc(db, 'sheets', sheet.id));
      toast.success('Sheet deleted');
      setOpen(false);
    } catch (e) {
      toast.error('Failed to delete sheet');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button 
          variant="ghost" 
          size="icon-xs" 
          className="text-zinc-500 hover:text-white" 
          onClick={(e) => {
            e.stopPropagation();
            setOpen(true);
          }}
        />
      }>
        <Pencil className="w-3.5 h-3.5" />
      </DialogTrigger>
      <DialogContent className="bg-[#141414] border-zinc-800 text-zinc-100" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Rename Sheet</DialogTitle>
            <Button variant="ghost" size="icon-sm" className="text-zinc-500 hover:text-destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
          <DialogDescription className="text-zinc-500">
            Update the name and description of your sheet.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Sheet Name</label>
            <Input 
              placeholder="e.g. Striver's SDE Sheet" 
              className="bg-zinc-900 border-zinc-800"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea 
              placeholder="What is this sheet about?" 
              className="bg-zinc-900 border-zinc-800"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={(e) => { e.stopPropagation(); setOpen(false); }} className="border-zinc-800 text-zinc-100">Cancel</Button>
          <Button onClick={handleUpdate}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddProblemDialog({ sheetId }: { sheetId: string }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');

  const handleAdd = async () => {
    try {
      await addDoc(collection(db, 'problems'), {
        sheetId,
        title,
        link,
        difficulty,
        status: 'Unsolved'
      });
      toast.success('Problem added');
      setOpen(false);
      setTitle('');
      setLink('');
    } catch (e) {
      toast.error('Failed to add problem');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-2" />}>
        <PlusCircle className="w-4 h-4" />
        Add Problem
      </DialogTrigger>
      <DialogContent className="bg-[#141414] border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle>Add Problem</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input 
              placeholder="Problem title" 
              className="bg-zinc-900 border-zinc-800"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Link</label>
            <Input 
              placeholder="LeetCode/GFG URL" 
              className="bg-zinc-900 border-zinc-800"
              value={link}
              onChange={(e) => setLink(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Difficulty</label>
            <Select value={difficulty} onValueChange={(v: any) => setDifficulty(v)}>
              <SelectTrigger className="bg-zinc-900 border-zinc-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} className="border-zinc-800">Cancel</Button>
          <Button onClick={handleAdd}>Add Problem</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddSolutionDialog({ problemId, onAdd }: { problemId: string, onAdd: () => void }) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [approach, setApproach] = useState('');
  const [tc, setTc] = useState('');
  const [sc, setSc] = useState('');
  const [type, setType] = useState<'Brute Force' | 'Better' | 'Optimal'>('Optimal');

  const handleAdd = async () => {
    try {
      await addDoc(collection(db, 'solutions'), {
        problemId,
        code,
        approach,
        tc,
        sc,
        type,
        createdAt: serverTimestamp()
      });
      toast.success('Solution added');
      onAdd();
      setOpen(false);
      setCode('');
      setApproach('');
      setTc('');
      setSc('');
    } catch (e) {
      toast.error('Failed to add solution');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-2 text-zinc-100" variant="outline" />}>
        <PlusCircle className="w-4 h-4" />
        Add Solution
      </DialogTrigger>
      <DialogContent className="bg-[#141414] border-zinc-800 text-zinc-100 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Solution</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={type} onValueChange={(v: any) => setType(v)}>
                <SelectTrigger className="bg-zinc-900 border-zinc-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800 text-zinc-100">
                  <SelectItem value="Brute Force">Brute Force</SelectItem>
                  <SelectItem value="Better">Better</SelectItem>
                  <SelectItem value="Optimal">Optimal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Time Complexity</label>
              <Input 
                placeholder="e.g. O(n log n)" 
                className="bg-zinc-900 border-zinc-800"
                value={tc}
                onChange={(e) => setTc(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Space Complexity</label>
            <Input 
              placeholder="e.g. O(1)" 
              className="bg-zinc-900 border-zinc-800"
              value={sc}
              onChange={(e) => setSc(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Approach / Notes</label>
            <Textarea 
              placeholder="Explain your approach, tricks, or how you triggered the solution..." 
              className="bg-zinc-900 border-zinc-800 min-h-[100px]"
              value={approach}
              onChange={(e) => setApproach(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Code</label>
            <Textarea 
              placeholder="Paste your implementation here..." 
              className="bg-zinc-900 border-zinc-800 font-mono min-h-[200px]"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} className="border-zinc-800 text-zinc-100">Cancel</Button>
          <Button onClick={handleAdd}>Save Solution</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function UploadSheetDialog({ onUpload }: { onUpload: (data: any) => void }) {
  const [open, setOpen] = useState(false);
  const [json, setJson] = useState('');

  const handleUpload = () => {
    try {
      const data = JSON.parse(json);
      if (!data.name || !Array.isArray(data.problems)) {
        throw new Error('Invalid format');
      }
      onUpload(data);
      setOpen(false);
      setJson('');
    } catch (e) {
      toast.error('Invalid JSON format. Expected { name, description, problems: [{ title, link, difficulty }] }');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" className="gap-2 border-zinc-800 text-zinc-100" />}>
        <Upload className="w-4 h-4" />
        Import JSON
      </DialogTrigger>
      <DialogContent className="bg-[#141414] border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle>Import DSA Sheet</DialogTitle>
          <DialogDescription className="text-zinc-500">
            Paste a JSON array of problems to bulk import.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">JSON Data</label>
            <Textarea 
              placeholder='{ "name": "My Sheet", "problems": [{ "title": "Two Sum", "link": "...", "difficulty": "Easy" }] }' 
              className="bg-zinc-900 border-zinc-800 font-mono min-h-[200px]"
              value={json}
              onChange={(e) => setJson(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} className="border-zinc-800 text-zinc-100">Cancel</Button>
          <Button onClick={handleUpload}>Import</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import * as pdfjsLib from 'pdfjs-dist';
// Use a more reliable worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

function UploadPDFDialog({ onUpload }: { onUpload: (data: { name: string, description: string, problems: any[] }) => void }) {
  const [open, setOpen] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
      }

      // Basic parsing logic based on the provided format
      const lines = fullText.split('\n');
      let companyName = 'Unknown Company';
      
      // Look for company name - usually near the top
      for (const line of lines.slice(0, 20)) {
        const trimmed = line.trim();
        // Skip common headers and table labels
        if (
          trimmed && 
          !trimmed.includes('Notice') && 
          !trimmed.includes('Select time period') && 
          !trimmed.includes('solved') && 
          !trimmed.includes('Title') && 
          !trimmed.includes('Acceptance') && 
          !trimmed.includes('Difficulty') &&
          !trimmed.includes('Frequency') &&
          trimmed.length > 2 &&
          trimmed.length < 50 // Company names are usually short
        ) {
          companyName = trimmed.replace(/[^\w\s]/g, '').trim();
          break;
        }
      }

      // Improved Regex to match: [Number] [Title] ([Link]) [Optional Symbol] [Acceptance] [Difficulty]
      // Example: 1 Two Sum (/problems/two-sum) 44.8% Easy
      // Example: 269 Alien Dictionary (/problems/alien-dictionary)  33.3% Hard
      const problemRegex = /(\d+)\s+(.+?)\s+\((\/problems\/[^\)]+)\)[\s\S]*?(\d+\.?\d*%)?\s*(Easy|Medium|Hard)/g;
      const problems: any[] = [];
      let match;

      while ((match = problemRegex.exec(fullText)) !== null) {
        problems.push({
          title: match[2].trim(),
          link: match[3].trim().replace(/\s+/g, ''), // Remove any accidental spaces in link
          difficulty: match[5]
        });
      }

      if (problems.length === 0) {
        // Fallback: try a more relaxed regex
        const relaxedRegex = /(.+?)\s+\((\/problems\/[^\)]+)\)[\s\S]*?(\d+\.?\d*%)?\s*(Easy|Medium|Hard)/g;
        while ((match = relaxedRegex.exec(fullText)) !== null) {
          problems.push({
            title: match[1].trim(),
            link: match[2].trim().replace(/\s+/g, ''),
            difficulty: match[4]
          });
        }
      }

      if (problems.length > 0) {
        onUpload({
          name: companyName,
          description: `Imported ${problems.length} problems from LeetCode PDF`,
          problems
        });
        setOpen(false);
      } else {
        toast.error('Could not find any problems in the PDF. Please ensure it is a LeetCode company problem list PDF.');
      }
    } catch (error) {
      console.error('PDF Parse Error:', error);
      toast.error('Failed to parse PDF');
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="outline" className="gap-2 border-zinc-800 text-zinc-100" />}>
        <FileText className="w-4 h-4" />
        Import PDF
      </DialogTrigger>
      <DialogContent className="bg-[#141414] border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle>Import LeetCode PDF</DialogTitle>
          <DialogDescription className="text-zinc-500">
            Upload a PDF of company-specific LeetCode questions to automatically create a sheet.
          </DialogDescription>
        </DialogHeader>
        <div className="py-8 flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-xl bg-zinc-900/50 hover:bg-zinc-900 transition-colors cursor-pointer relative">
          {isParsing ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-zinc-400">Parsing PDF content...</p>
            </div>
          ) : (
            <>
              <Upload className="w-10 h-10 text-zinc-600 mb-4" />
              <p className="text-sm text-zinc-400">Click to upload or drag and drop</p>
              <p className="text-xs text-zinc-600 mt-1">PDF files only</p>
              <input 
                type="file" 
                accept=".pdf" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                onChange={handleFileChange}
                disabled={isParsing}
              />
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} className="border-zinc-800 text-zinc-100">Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
