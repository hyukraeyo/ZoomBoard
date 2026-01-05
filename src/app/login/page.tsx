'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import styles from './LoginPage.module.css';
import { useAuthStore } from '@/store/useAuthStore';

export default function LoginPage() {
    const { user, isLoading: isAuthLoading } = useAuthStore();
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCheckingId, setIsCheckingId] = useState(false);
    const [isIdChecked, setIsIdChecked] = useState(false);
    const [isIdAvailable, setIsIdAvailable] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [idCheckMessage, setIdCheckMessage] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (!isAuthLoading && user) {
            router.replace('/');
        }
    }, [user, isAuthLoading, router]);

    // ID를 Supabase 이메일 형식으로 변환 (내부 처리용)
    const getEmailFromId = (id: string) => `${id}@id.zoomboard.app`;

    const handleUsernameChange = (value: string) => {
        setUsername(value);
        // 아이디가 바뀌면 중복 확인 상태 리셋
        setIsIdChecked(false);
        setIsIdAvailable(false);
        setIdCheckMessage(null);
    };

    const checkIdDuplicate = async () => {
        if (!username.trim()) {
            setIdCheckMessage('아이디를 입력해주세요.');
            return;
        }

        // 아이디 유효성 검사: 영문, 숫자, 언더스코어만 허용 (3~20자)
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!usernameRegex.test(username)) {
            setIdCheckMessage('아이디는 3~20자의 영문, 숫자, 언더스코어(_)만 사용 가능합니다.');
            return;
        }

        setIsCheckingId(true);
        setIdCheckMessage(null);

        // signIn을 시도해서 결과로 중복 여부 판단
        const { error } = await supabase.auth.signInWithPassword({
            email: getEmailFromId(username),
            password: 'dummy_check_password',
        });

        setIsCheckingId(false);
        setIsIdChecked(true);

        if (error?.message?.includes('Invalid login credentials')) {
            setIsIdAvailable(true);
            setIdCheckMessage('사용 가능한 아이디입니다!');
        } else {
            setIsIdAvailable(false);
            setIdCheckMessage('이미 사용 중인 아이디입니다.');
        }
    };

    const handleAction = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (mode === 'signup') {
            // 아이디 중복 확인 체크
            if (!isIdChecked || !isIdAvailable) {
                setError('아이디 중복 확인을 먼저 해주세요.');
                setIsLoading(false);
                return;
            }

            if (password !== confirmPassword) {
                setError('비밀번호가 일치하지 않습니다.');
                setIsLoading(false);
                return;
            }
            if (password.length < 6) {
                setError('비밀번호는 최소 6자 이상이어야 합니다.');
                setIsLoading(false);
                return;
            }

            const { error: signUpError } = await supabase.auth.signUp({
                email: getEmailFromId(username),
                password,
            });

            if (signUpError) {
                setError(signUpError.message);
                setIsLoading(false);
            } else {
                // 가입 성공 시 바로 로그인 시도
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email: getEmailFromId(username),
                    password,
                });

                if (signInError) {
                    setMode('login');
                    setError('회원가입 성공! 이제 로그인해주세요.');
                    setIsLoading(false);
                } else {
                    router.push('/');
                }
            }
        } else {
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: getEmailFromId(username),
                password,
            });

            if (signInError) {
                setError('아이디 또는 비밀번호가 잘못되었습니다.');
                setIsLoading(false);
            } else {
                router.push('/');
            }
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.loginCard}>
                <h1 className={styles.title}>ZoomBoard</h1>
                <p className={styles.subtitle}>
                    {mode === 'login' ? '계정에 로그인하여 나만의 보드를 관리하세요.' : '새로운 계정을 생성하고 보드를 시작하세요.'}
                </p>

                <form onSubmit={handleAction} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label>아이디</label>
                        {mode === 'signup' ? (
                            <>
                                <div className={styles.inputIdWrapper}>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => handleUsernameChange(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={checkIdDuplicate}
                                        className={`${styles.checkButton} ${isIdAvailable ? styles.success : ''}`}
                                        disabled={isCheckingId || !username.trim()}
                                    >
                                        {isCheckingId ? '확인 중...' : (isIdAvailable ? '✓ 확인됨' : '중복 확인')}
                                    </button>
                                </div>
                                {idCheckMessage && (
                                    <p className={isIdAvailable ? styles.successMsg : styles.error}>
                                        {idCheckMessage}
                                    </p>
                                )}
                            </>
                        ) : (
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        )}
                    </div>
                    <div className={styles.inputGroup}>
                        <label>비밀번호</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {mode === 'signup' && (
                        <div className={styles.inputGroup}>
                            <label>비밀번호 확인</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    {error && <p className={styles.error}>{error}</p>}

                    <button type="submit" className={styles.loginButton} disabled={isLoading}>
                        {isLoading ? '처리 중...' : (mode === 'login' ? '로그인' : '회원가입')}
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setMode(mode === 'login' ? 'signup' : 'login');
                            setError(null);
                            setIsIdChecked(false);
                            setIsIdAvailable(false);
                            setIdCheckMessage(null);
                        }}
                        className={styles.signUpButton}
                        disabled={isLoading}
                    >
                        {mode === 'login' ? '계정이 없으신가요? 회원가입' : '이미 계정이 있나요? 로그인'}
                    </button>
                </form>

                <div className={styles.footer}>
                    <p onClick={() => router.push('/')}>나중에 하기 (둘러보기)</p>
                </div>
            </div>
        </div>
    );
}
