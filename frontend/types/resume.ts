export type Resume = {
    id: number;
    user_id: number;
    title: string;
    filename: string;
    file_path: string;
    extracted_text: string | null;
    created_at: string;
    updated_at: string;
  };