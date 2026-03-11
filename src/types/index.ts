export interface User {
    id: string;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
    profile_picture?: string;
    bio?: string;
    avatar?: string;
    date_joined: string;
    roles?: {org: string; role: string}[];
}

export interface Organization {
    id: string;
    name: string;
    creator?: string;
    created_at: string;
    updated_at: string;
    is_public?: boolean;
    member_count?: number;
    user_role?: 'admin' | 'instructor' | 'student' | null;
    description?: string;
}

export interface OrganizationMember {
    id: string;
    user: {
        id: string;
        username: string;
        email: string;
        profile_picture?: string;
    };
    organization: string;
    role: 'admin' | 'instructor' | 'student';
    joined_at: string;
}

export interface JoinRequest {
    id: string;
    user: {
        id: string;
        username: string;
        email: string;
        profile_picture?: string;
    };
    organization: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
}

export interface Course {
    id: string;
    title: string;
    description: string;
    instructor: string;
    thumbnail?: string;
    category: string;
    duration: string;
    level: string;
    enrolled: number;
    rating: number;
    total_lessons: number;
    price: number;
    is_free: boolean;
    allows_installments: boolean;
    installment_count: number;
    installment_amount?: number;
    organization: string;
    modules?: Module[];
    isEnrolled?: boolean;
    progress?: number;
    completedLessons?: number;
}

export interface Module {
    id: string;
    course: string;
    title: string;
    order: number;
    lessons?: Lesson[];
}

export interface Lesson {
    id: string;
    module: string;
    title: string;
    content: string;
    lesson_type: 'video' | 'text' | 'quiz';
    video_url?: string;
    video_file?: string;
    order: number;
    summary?: string;
    transcript?: string;
    is_preview: boolean;
}

export interface Enrollment {
    id: string;
    userId: string;
    courseId: string;
    progress: number;
    completedLessons: number;
    isCompleted: boolean;
}

export interface Assignment {
    id: string;
    course: string;
    courseId: string;
    courseName: string;
    instructor: string;
    categoryName: string;
    levelName: string;
    title: string;
    description: string;
    dueDate: string;
    points: number;
    status: string;
}

export interface Category {
    id: number;
    name: string;
}

export interface Level {
    id: number;
    name: string;
}

export interface Transaction {
    id: string;
    user: string;
    course: string;
    stripe_checkout_id: string;
    stripe_payment_intent_id?: string;
    amount: number;
    status: 'pending' | 'partially_paid' | 'completed' | 'refunded' | 'failed';
    is_installment: boolean;
    total_installments: number;
    installments_paid: number;
    created_at: string;
}

export interface Delegation {
    id: string;
    granted_to: string;
    granted_by: string;
    organization: string;
    temp_role: 'instructor' | 'admin';
    expires_at?: string;
    is_active: boolean;
    created_at: string;
    revoked_at?: string;
    reason?: string;
}
