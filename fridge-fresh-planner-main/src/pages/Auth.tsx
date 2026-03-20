import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              display_name: email.split('@')[0],
            }
          }
        });
        if (error) throw error;
        toast.success("Регистрация успешна! Проверьте почту.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("С возвращением!");
      }
    } catch (error: any) {
      toast.error(error.message || "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">{isSignUp ? "Регистрация" : "Вход"}</CardTitle>
          <CardDescription className="text-center">Введите данные для доступа к холодильнику</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <Input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? "...⏳" : isSignUp ? "Создать аккаунт" : "Войти"}
            </Button>
            <Button variant="link" className="w-full" type="button" onClick={() => setIsSignUp(!isSignUp)}>
              {isSignUp ? "Уже есть аккаунт?" : "Нет аккаунта?"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;