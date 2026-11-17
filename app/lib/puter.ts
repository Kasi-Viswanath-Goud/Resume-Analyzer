// Simple local storage wrapper to replace Puter.js functionality
// This allows the app to work without authentication

interface KVItem {
  key: string;
  value: string;
}

interface PuterStore {
  auth: {
    isAuthenticated: boolean;
    user: { username: string } | null;
    signIn: () => void;
    signOut: () => void;
  };
  isLoading: boolean;
  error: string | null;
  kv: {
    get: (key: string) => Promise<string | null>;
    set: (key: string, value: string) => Promise<void>;
    list: (pattern: string, all?: boolean) => Promise<KVItem[] | undefined>;
    delete: (key: string) => Promise<void>;
    flush: () => Promise<void>;
  };
  fs: {
    upload: (files: File[]) => Promise<{ path: string }[]>;
    read: (path: string) => Promise<ArrayBuffer | null>;
    readDir: (path: string) => Promise<any[]>;
    delete: (path: string) => Promise<void>;
  };
  ai: {
    feedback: (filePath: string, instructions: string) => Promise<any>;
  };
}

// Mock user for compatibility
const mockUser = { username: 'guest' };

// Simple in-memory storage with localStorage persistence
class LocalStorage {
  private prefix = 'resumind_';

  async get(key: string): Promise<string | null> {
    try {
      const item = localStorage.getItem(this.prefix + key);
      return item;
    } catch {
      return null;
    }
  }

  async set(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(this.prefix + key, value);
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  async list(pattern: string): Promise<KVItem[] | undefined> {
    try {
      const prefix = this.prefix + pattern.replace('*', '');
      const items: KVItem[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          const value = localStorage.getItem(key);
          if (value) {
            items.push({ key: key.replace(this.prefix, ''), value });
          }
        }
      }
      return items;
    } catch {
      return undefined;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch {
      // ignore
    }
  }

  async flush(): Promise<void> {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch {
      // ignore
    }
  }
}

// File storage using object URLs and localStorage
class FileStorage {
  private blobs = new Map<string, Blob>();
  private prefix = 'resumind_file_';

  async upload(files: File[]): Promise<{ path: string }[]> {
    const results = [];
    for (const file of files) {
      const id = 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      const path = this.prefix + id;
      this.blobs.set(path, file);
      // Also store in localStorage as base64 for persistence
      try {
        const base64 = await this.fileToBase64(file);
        localStorage.setItem(path, base64);
      } catch (e) {
        console.warn('Could not persist file to localStorage:', e);
      }
      results.push({ path });
    }
    return results;
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private base64ToBlob(base64: string): Blob {
    const byteString = atob(base64.split(',')[1]);
    const mimeString = base64.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  async read(path: string): Promise<ArrayBuffer | null> {
    // First check memory
    const blob = this.blobs.get(path);
    if (blob) {
      return blob.arrayBuffer();
    }
    // Then check localStorage
    try {
      const base64 = localStorage.getItem(path);
      if (base64) {
        const blob = this.base64ToBlob(base64);
        this.blobs.set(path, blob);
        return blob.arrayBuffer();
      }
    } catch {
      // ignore
    }
    return null;
  }

  async readDir(path: string): Promise<any[]> {
    const files = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        files.push({ name: key, path: key, id: key });
      }
    }
    return files;
  }

  async delete(path: string): Promise<void> {
    this.blobs.delete(path);
    localStorage.removeItem(path);
  }
}

// AI feedback simulation - in production, this would call your AI service
async function mockAIFeedback(filePath: string, instructions: string): Promise<any> {
  // Simulate API delay
  await new Promise(r => setTimeout(r, 2000));

  // Return mock feedback structure
  return {
    message: {
      content: JSON.stringify({
        overallScore: Math.floor(Math.random() * 30) + 60,
        ATS: {
          score: Math.floor(Math.random() * 30) + 60,
          tips: [
            { type: "good", tip: "Resume uses standard section headers" },
            { type: "improve", tip: "Add more job-specific keywords from the description" },
            { type: "good", tip: "Clean, single-column layout is ATS-friendly" },
            { type: "improve", tip: "Include more quantifiable achievements with metrics" }
          ]
        },
        toneAndStyle: {
          score: Math.floor(Math.random() * 30) + 60,
          tips: [
            { type: "good", tip: "Professional tone throughout", explanation: "Your resume maintains a consistent professional voice appropriate for the industry." },
            { type: "improve", tip: "Use stronger action verbs", explanation: "Replace passive phrases like 'responsible for' with strong verbs like 'led', 'created', 'optimized'." },
            { type: "good", tip: "Concise bullet points", explanation: "Bullets are well-structured and easy to scan quickly." }
          ]
        },
        content: {
          score: Math.floor(Math.random() * 30) + 60,
          tips: [
            { type: "improve", tip: "Add more relevant keywords", explanation: "The job description mentions specific tools/skills not found in your resume." },
            { type: "good", tip: "Good experience relevance", explanation: "Your background aligns well with the target role requirements." },
            { type: "improve", tip: "Quantify more achievements", explanation: "Add numbers, percentages, and dollar amounts to demonstrate impact." }
          ]
        },
        structure: {
          score: Math.floor(Math.random() * 30) + 60,
          tips: [
            { type: "good", tip: "Logical section ordering", explanation: "Sections follow standard resume convention: Summary, Experience, Education, Skills." },
            { type: "improve", tip: "Consider adding a Projects section", explanation: "For technical roles, a projects section can showcase hands-on experience." },
            { type: "good", tip: "Appropriate length", explanation: "Resume fits well within 1-2 pages for your experience level." }
          ]
        },
        skills: {
          score: Math.floor(Math.random() * 30) + 60,
          tips: [
            { type: "improve", tip: "Add missing technical skills", explanation: "Job requires specific technologies not listed in your skills section." },
            { type: "good", tip: "Good mix of hard and soft skills", explanation: "You've included both technical competencies and interpersonal abilities." },
            { type: "improve", tip: "Group skills by category", explanation: "Organize skills into categories like Languages, Frameworks, Tools, Soft Skills." }
          ]
        }
      })
    }
  };
}

// Create the store
// NOTE: do not name the KV instance `localStorage` — it would shadow the browser
// global inside the class methods and silently break all persistence.
const localKV = new LocalStorage();
const fileStorage = new FileStorage();

// Single stable store instance. Returning a new object from the hook on every
// render makes components that depend on kv/fs re-run their effects forever.
const store: PuterStore = {
  auth: {
    isAuthenticated: true,
    user: mockUser,
    signIn: () => {},
    signOut: () => {},
  },
  isLoading: false,
  error: null,
  kv: {
    get: (key: string) => localKV.get(key),
    set: (key: string, value: string) => localKV.set(key, value),
    list: (pattern: string) => localKV.list(pattern),
    delete: (key: string) => localKV.delete(key),
    flush: () => localKV.flush(),
  },
  fs: {
    upload: (files: File[]) => fileStorage.upload(files),
    read: (path: string) => fileStorage.read(path),
    readDir: (path: string) => fileStorage.readDir(path),
    delete: (path: string) => fileStorage.delete(path),
  },
  ai: {
    feedback: mockAIFeedback,
  },
};

export const usePuterStore = (): PuterStore => store;

// For non-hook usage
export const puter = store;
