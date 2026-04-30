import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Loader2, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const nameSchema = z.string().min(2, 'Name must be at least 2 characters');

export default function Auth() {
  const { user, loading, signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  // Redirect if already logged in
  if (user && !loading) {
    return <Navigate to="/" replace />;
  }

  const validateLogin = () => {
    const newErrors: Record<string, string> = {};

    try {
      emailSchema.parse(loginEmail);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.loginEmail = e.errors[0].message;
      }
    }

    try {
      passwordSchema.parse(loginPassword);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.loginPassword = e.errors[0].message;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignup = () => {
    const newErrors: Record<string, string> = {};

    try {
      nameSchema.parse(signupName);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.signupName = e.errors[0].message;
      }
    }

    try {
      emailSchema.parse(signupEmail);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.signupEmail = e.errors[0].message;
      }
    }

    try {
      passwordSchema.parse(signupPassword);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.signupPassword = e.errors[0].message;
      }
    }

    if (signupPassword !== signupConfirmPassword) {
      newErrors.signupConfirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLogin()) return;

    setIsSubmitting(true);
    await signIn(loginEmail, loginPassword);
    setIsSubmitting(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignup()) return;

    setIsSubmitting(true);
    const { error } = await signUp(signupEmail, signupPassword, signupName);
    if (!error) {
      // Auto-login after signup
      await signIn(signupEmail, signupPassword);
    }
    setIsSubmitting(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    try {
      emailSchema.parse(forgotEmail);
    } catch (err) {
      if (err instanceof z.ZodError) {
        newErrors.forgotEmail = err.errors[0].message;
      }
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to send reset email',
        description: error.message,
      });
    } else {
      setResetEmailSent(true);
      toast({
        title: 'Reset email sent!',
        description: 'Check your inbox for a password reset link.',
      });
    }
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center animate-pulse-glow">
            <Brain className="w-7 h-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text">TROS</h1>
            <p className="text-xs text-muted-foreground">Total Resource Optimization System</p>
          </div>
        </div>

        <Card className="glass-card border-border">
          {showForgotPassword ? (
            <>
              <CardHeader className="text-center">
                <CardTitle>{resetEmailSent ? 'Check Your Email' : 'Reset Password'}</CardTitle>
                <CardDescription>
                  {resetEmailSent
                    ? 'We sent a password reset link to your email address.'
                    : 'Enter your email and we\'ll send you a reset link'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {resetEmailSent ? (
                  <div className="space-y-4 text-center">
                    <Mail className="w-12 h-12 mx-auto text-primary" />
                    <p className="text-sm text-muted-foreground">
                      Didn't receive it? Check your spam folder or try again.
                    </p>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setShowForgotPassword(false);
                        setResetEmailSent(false);
                      }}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Sign In
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="forgot-email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="forgot-email"
                          type="email"
                          placeholder="you@example.com"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          className="pl-10 bg-secondary/50"
                        />
                      </div>
                      {errors.forgotEmail && (
                        <p className="text-xs text-destructive">{errors.forgotEmail}</p>
                      )}
                    </div>
                    <Button type="submit" variant="gradient" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Reset Link'}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={() => setShowForgotPassword(false)}
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Sign In
                    </Button>
                  </form>
                )}
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader className="text-center">
                <CardTitle>Welcome</CardTitle>
                <CardDescription>
                  Sign in to access the resource management system
                </CardDescription>
              </CardHeader>
              <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="pl-10 bg-secondary/50"
                      />
                    </div>
                    {errors.loginEmail && (
                      <p className="text-xs text-destructive">{errors.loginEmail}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="pl-10 bg-secondary/50"
                      />
                    </div>
                    {errors.loginPassword && (
                      <p className="text-xs text-destructive">{errors.loginPassword}</p>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="link"
                      className="px-0 text-xs text-muted-foreground"
                      onClick={() => {
                        setShowForgotPassword(true);
                        setForgotEmail(loginEmail);
                      }}
                    >
                      Forgot password?
                    </Button>
                  </div>

                  <Button
                    type="submit"
                    variant="gradient"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="John Doe"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        className="pl-10 bg-secondary/50"
                      />
                    </div>
                    {errors.signupName && (
                      <p className="text-xs text-destructive">{errors.signupName}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        className="pl-10 bg-secondary/50"
                      />
                    </div>
                    {errors.signupEmail && (
                      <p className="text-xs text-destructive">{errors.signupEmail}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="pl-10 bg-secondary/50"
                      />
                    </div>
                    {errors.signupPassword && (
                      <p className="text-xs text-destructive">{errors.signupPassword}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-confirm-password"
                        type="password"
                        placeholder="••••••••"
                        value={signupConfirmPassword}
                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                        className="pl-10 bg-secondary/50"
                      />
                    </div>
                    {errors.signupConfirmPassword && (
                      <p className="text-xs text-destructive">{errors.signupConfirmPassword}</p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    variant="gradient"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Create Account'
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    By signing up, new users are assigned the Student role by default.
                    Contact an admin to upgrade your access level.
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
