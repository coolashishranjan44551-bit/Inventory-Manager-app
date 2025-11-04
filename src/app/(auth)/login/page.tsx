import { AuthForm } from '../../../components/auth-form';

export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Sign in to your café</h1>
        <p className="text-sm text-slate-600">Use your email to receive a secure magic link.</p>
      </div>
      <AuthForm />
    </div>
  );
}
