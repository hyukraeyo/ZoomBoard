'use client';

import { useRouter } from 'next/navigation';
import LoginModal from '@/components/auth/LoginModal';

export default function LoginInterceptedPage() {
    const router = useRouter();

    const handleClose = () => {
        router.back();
    };

    return <LoginModal onClose={handleClose} />;
}
