import { Shield, Lock, Globe, Smartphone, Zap, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface HomePageProps {
  onNavigate: (page: string) => void;
}

export function HomePage({ onNavigate }: HomePageProps) {
  const features = [
    {
      icon: Lock,
      title: 'Банковское шифрование',
      description: 'Ваши пароли защищены шифрованием AES-256',
    },
    {
      icon: Globe,
      title: 'Кроссплатформенная синхронизация',
      description: 'Доступ к паролям на любом устройстве',
    },
    {
      icon: Smartphone,
      title: 'Мобильные и десктоп',
      description: 'Приложения для iOS, Android, Windows и Mac',
    },
    {
      icon: Zap,
      title: 'Генератор паролей',
      description: 'Создавайте надежные пароли мгновенно',
    },
  ];

  const benefits = [
    'Неограниченное хранилище паролей',
    'Безопасный обмен паролями',
    'Двухфакторная аутентификация',
    'Автоматическое сохранение паролей',
    'Оповещения об утечках данных',
    'Цифровой кошелек для платежей',
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-foreground text-background mb-6">
            <Shield className="h-10 w-10" />
          </div>
          <h1 className="mb-6">
            Ваша цифровая жизнь,
            <br />
            защищенная в одном месте
          </h1>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            SecureVault — самый надежный менеджер паролей для частных лиц и бизнеса.
            Храните, генерируйте и управляйте всеми паролями с военным шифрованием.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => onNavigate('login')}>
              Начать бесплатно
            </Button>
            <Button size="lg" variant="outline" onClick={() => onNavigate('login')}>
              Попробовать приложение
            </Button>
          </div>
          <p className="text-muted-foreground mt-4">
            Кредитная карта не требуется • Гарантия возврата денег 30 дней
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6 bg-muted/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="mb-4">Почему SecureVault?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Мощные функции для защиты и организации вашей цифровой жизни
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-foreground text-background mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="mb-6">Все необходимое для безопасности</h2>
              <p className="text-muted-foreground mb-8">
                SecureVault обеспечивает комплексную защиту всех ваших аккаунтов с функциями,
                разработанными для частных лиц и команд.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="mt-1">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-muted rounded-lg p-8 flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <Shield className="h-32 w-32 mx-auto text-foreground/20 mb-4" />
                <p className="text-muted-foreground">Предварительный просмотр приложения</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-foreground text-background">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="mb-4">Готовы защитить свою цифровую жизнь?</h2>
          <p className="mb-8 opacity-90">
            Присоединяйтесь к миллионам пользователей, доверяющих SecureVault
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => onNavigate('login')}
          >
            Начать использовать SecureVault
          </Button>
        </div>
      </section>
    </div>
  );
}
