export type UserRole = 'student' | 'faculty' | 'admin';

export interface User {
  id: number;
  member_id: string; // e.g. 21001A0501 or JNTUA-FAC-101
  name: string;
  email: string;
  role: UserRole;
  department: string;
  phone?: string;
  max_books_allowed: number;
  status: 'active' | 'inactive' | 'suspended';
}

export interface UserStats {
  currentBorrowed: number;
  activeReservations: number;
  totalFines: number;
  totalPaid: number;
  maxAllowed: number;
}

export interface Category {
  id: number;
  name: string;
  code: string;
  description: string;
  book_count?: number;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  category_id: number;
  category_name?: string;
  category_code?: string;
  price: number;
  description: string;
  total_copies: number;
  available_copies: number;
  shelf_location: string;
  cover_image?: string;
  status: 'active' | 'inactive';
  pending_reservations?: number;
  user_already_borrowed?: boolean;
  user_already_reserved?: boolean;
  user_queue_position?: number | null;
}

export interface Transaction {
  id: number;
  user_id: number;
  book_id: number;
  book_title?: string;
  title?: string;
  author?: string;
  isbn?: string;
  shelf_location?: string;
  cover_image?: string;
  category_name?: string;
  user_name?: string;
  member_id?: string;
  user_role?: string;
  department?: string;
  issue_date: string;
  due_date: string;
  return_date?: string | null;
  status: 'issued' | 'returned' | 'lost' | 'damaged';
  calculated_fine: number;
  lost_damaged_charge: number;
  adjusted_fine?: number | null;
  waiver_reason?: string | null;
  adjusted_by?: number | null;
  adjusted_by_name?: string | null;
  total_paid: number;
  notes?: string;
  // Computed live properties for active issues
  live_overdue_days?: number;
  days_overdue?: number;
  live_fine?: number;
  is_overdue?: boolean;
  days_remaining?: number;
}

export interface Reservation {
  id: number;
  user_id: number;
  book_id: number;
  book_title?: string;
  book_author?: string;
  isbn?: string;
  shelf_location?: string;
  cover_image?: string;
  available_copies?: number;
  user_name?: string;
  member_id?: string;
  user_role?: string;
  department?: string;
  reservation_date: string;
  queue_position: number;
  status: 'pending' | 'ready_for_pickup' | 'fulfilled' | 'cancelled';
  notified_at?: string | null;
}

export interface DashboardStats {
  totalTitles: number;
  totalCopies: number;
  availableCopies: number;
  currentlyIssued: number;
  overdueCount: number;
  totalStudents: number;
  totalFaculty: number;
  activeReservations: number;
  totalFinesAccrued: number;
  totalFinesCollected: number;
}

export interface LibrarySettings {
  [key: string]: {
    value: string;
    description: string;
    updatedAt: string;
  };
}
