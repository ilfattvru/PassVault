import { useCallback, useEffect, useMemo, useState } from 'react';
import { KeyRound, ShieldCheck, UserCog, Users } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch, isForbidden, isUnauthorized } from '@/shared/api/http';
import { Card } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { Badge } from '@/shared/ui/badge';
import { useNavigate } from 'react-router-dom';

type Worker = {
  id: number;
  username?: string;
  login?: string;
  email?: string;
  roles?: Array<{ id: number; name: string }>;
};

type Role = {
  id: number;
  name: string;
};

type EntryLite = {
  id: number;
  title: string;
};

export function ManagementPage() {
  const navigate = useNavigate();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [entries, setEntries] = useState<EntryLite[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [selectedEntryId, setSelectedEntryId] = useState<string>('');
  const [canView, setCanView] = useState(true);
  const [canEdit, setCanEdit] = useState(false);

  const handleProtectedError = useCallback(
    async (response: Response) => {
      if (isUnauthorized(response)) {
        navigate('/login', { replace: true });
        return true;
      }
      if (isForbidden(response)) {
        toast.error('У вас нет прав для этой операции');
        navigate('/app', { replace: true });
        return true;
      }
      return false;
    },
    [navigate],
  );

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [workersResponse, rolesResponse, entriesResponse] = await Promise.all([
        apiFetch('/management/department-workers'),
        apiFetch('/management/assignable-roles'),
        apiFetch('/management/entries/all'),
      ]);

      if (
        (await handleProtectedError(workersResponse)) ||
        (await handleProtectedError(rolesResponse)) ||
        (await handleProtectedError(entriesResponse))
      ) {
        return;
      }

      const workersData = workersResponse.status === 200 ? await workersResponse.json() : [];
      const rolesData = rolesResponse.status === 200 ? await rolesResponse.json() : [];
      const entriesData = entriesResponse.status === 200 ? await entriesResponse.json() : [];

      setWorkers(workersData);
      setRoles(rolesData);
      setEntries(entriesData.map((entry: any) => ({ id: entry.id, title: entry.title })));
    } catch {
      toast.error('Не удалось загрузить данные для управления доступом');
    } finally {
      setIsLoading(false);
    }
  }, [handleProtectedError]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectedWorker = useMemo(
    () => workers.find((worker) => worker.id.toString() === selectedWorkerId),
    [workers, selectedWorkerId],
  );

  const submitJson = useCallback(
    async (path: string, method: string, body?: unknown) => {
      const response = await apiFetch(path, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (await handleProtectedError(response)) return false;
      if (response.status >= 200 && response.status < 300) return true;

      const text = await response.text();
      toast.error(text || 'Операция не выполнена');
      return false;
    },
    [handleProtectedError],
  );

  const assignRole = useCallback(async () => {
    if (!selectedWorkerId || !selectedRoleId) {
      toast.error('Выберите сотрудника и роль');
      return;
    }

    const ok = await submitJson('/management/assign-role', 'POST', {
      targetUserId: Number(selectedWorkerId),
      roleId: Number(selectedRoleId),
    });

    if (ok) {
      toast.success('Роль назначена');
      await loadData();
    }
  }, [selectedRoleId, selectedWorkerId, submitJson, loadData]);

  const removeRole = useCallback(async () => {
    if (!selectedWorkerId || !selectedRoleId) {
      toast.error('Выберите сотрудника и роль');
      return;
    }

    const ok = await submitJson('/management/remove-role', 'POST', {
      targetUserId: Number(selectedWorkerId),
      roleId: Number(selectedRoleId),
    });

    if (ok) {
      toast.success('Роль снята');
      await loadData();
    }
  }, [selectedRoleId, selectedWorkerId, submitJson, loadData]);

  const assignRoleAccess = useCallback(async () => {
    if (!selectedRoleId || !selectedEntryId) {
      toast.error('Выберите роль и запись');
      return;
    }

    const ok = await submitJson('/management/assign-role-access', 'POST', {
      roleId: Number(selectedRoleId),
      entryId: Number(selectedEntryId),
      canView,
      canEdit,
    });

    if (ok) {
      toast.success('Доступ для роли сохранён');
    }
  }, [selectedEntryId, selectedRoleId, canView, canEdit, submitJson]);

  const assignUserAccess = useCallback(async () => {
    if (!selectedWorkerId || !selectedEntryId) {
      toast.error('Выберите сотрудника и запись');
      return;
    }

    const ok = await submitJson('/management/assign-user-access', 'POST', {
      targetUserId: Number(selectedWorkerId),
      entryId: Number(selectedEntryId),
      canView,
      canEdit,
    });

    if (ok) {
      toast.success('Персональный доступ сохранён');
    }
  }, [selectedWorkerId, selectedEntryId, canView, canEdit, submitJson]);

  const revokeUserAccess = useCallback(async () => {
    if (!selectedWorkerId || !selectedEntryId) {
      toast.error('Выберите сотрудника и запись');
      return;
    }

    const response = await apiFetch(
      `/management/revoke-user-access?targetUserId=${encodeURIComponent(selectedWorkerId)}&entryId=${encodeURIComponent(selectedEntryId)}`,
      { method: 'DELETE' },
    );

    if (await handleProtectedError(response)) return;

    if (response.status >= 200 && response.status < 300) {
      toast.success('Персональный доступ удалён');
      return;
    }

    const text = await response.text();
    toast.error(text || 'Не удалось удалить персональный доступ');
  }, [selectedWorkerId, selectedEntryId, handleProtectedError]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка панели управления...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-6 py-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5" />
              <div>
                <p className="text-muted-foreground">Сотрудники</p>
                <p className="text-2xl font-semibold">{workers.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5" />
              <div>
                <p className="text-muted-foreground">Доступные роли</p>
                <p className="text-2xl font-semibold">{roles.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <KeyRound className="h-5 w-5" />
              <div>
                <p className="text-muted-foreground">Доступные записи</p>
                <p className="text-2xl font-semibold">{entries.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <UserCog className="h-5 w-5" />
              <div>
                <p className="text-muted-foreground">Выбранный сотрудник</p>
                <p className="text-sm font-medium truncate">{selectedWorker?.username || selectedWorker?.login || selectedWorker?.email || 'Не выбран'}</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6 space-y-4">
          <h1 className="text-2xl font-semibold">Управление ролями и доступом</h1>
          <p className="text-muted-foreground">
            Здесь можно назначать роли сотрудникам отдела и выдавать доступ к конкретным записям ролям или отдельным пользователям.
          </p>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="p-6 space-y-4">
            <h2 className="text-lg font-semibold">Сотрудники</h2>
            <div className="space-y-3 max-h-[520px] overflow-auto">
              {workers.length === 0 ? (
                <p className="text-muted-foreground">Нет доступных сотрудников.</p>
              ) : (
                workers.map((worker) => {
                  const isSelected = worker.id.toString() === selectedWorkerId;
                  return (
                    <button
                      key={worker.id}
                      type="button"
                      onClick={() => setSelectedWorkerId(worker.id.toString())}
                      className={`w-full text-left rounded-lg border p-4 transition-colors ${
                        isSelected ? 'border-foreground bg-muted' : 'border-border hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{worker.username || worker.login || worker.email || `User #${worker.id}`}</p>
                          <p className="text-sm text-muted-foreground">ID: {worker.id}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-end">
                          {worker.roles?.length ? (
                            worker.roles.map((role) => (
                              <Badge key={role.id} variant="secondary">{role.name}</Badge>
                            ))
                          ) : (
                            <Badge variant="outline">Без ролей</Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="grid gap-4">
              <div>
                <Label>Роль</Label>
                <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите роль" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Запись</Label>
                <Select value={selectedEntryId} onValueChange={setSelectedEntryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите запись" />
                  </SelectTrigger>
                  <SelectContent>
                    {entries.map((entry) => (
                      <SelectItem key={entry.id} value={entry.id.toString()}>
                        {entry.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <Button type="button" onClick={assignRole}>Назначить роль сотруднику</Button>
                <Button type="button" variant="outline" onClick={removeRole}>Снять роль</Button>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="role-access" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="role-access">Доступ для роли</TabsTrigger>
            <TabsTrigger value="user-access">Персональный доступ</TabsTrigger>
          </TabsList>

          <TabsContent value="role-access">
            <Card className="p-6 space-y-4">
              <h3 className="text-lg font-semibold">Выдать доступ роли к записи</h3>
              <p className="text-muted-foreground">Роль получит доступ ко всем записям, для которых вы сохраните эти права.</p>
              <PermissionEditor
                canView={canView}
                canEdit={canEdit}
                onCanViewChange={setCanView}
                onCanEditChange={setCanEdit}
              />
              <Button onClick={assignRoleAccess}>Сохранить доступ для роли</Button>
            </Card>
          </TabsContent>

          <TabsContent value="user-access">
            <Card className="p-6 space-y-4">
              <h3 className="text-lg font-semibold">Выдать персональный доступ пользователю</h3>
              <p className="text-muted-foreground">Персональные права имеют приоритет над правами, которые пользователь получает через роль.</p>
              <PermissionEditor
                canView={canView}
                canEdit={canEdit}
                onCanViewChange={setCanView}
                onCanEditChange={setCanEdit}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <Button onClick={assignUserAccess}>Сохранить персональный доступ</Button>
                <Button variant="outline" onClick={revokeUserAccess}>Удалить персональный доступ</Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

type PermissionEditorProps = {
  canView: boolean;
  canEdit: boolean;
  onCanViewChange: (value: boolean) => void;
  onCanEditChange: (value: boolean) => void;
};

function PermissionEditor({ canView, canEdit, onCanViewChange, onCanEditChange }: PermissionEditorProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card className="p-4 space-y-3">
        <Label htmlFor="canView">Просмотр</Label>
        <div className="flex items-center gap-3">
          <Input
            id="canView"
            type="checkbox"
            checked={canView}
            onChange={(event) => onCanViewChange(event.target.checked)}
            className="h-4 w-4"
          />
          <span className="text-sm text-muted-foreground">Пользователь или роль смогут открыть запись</span>
        </div>
      </Card>
      <Card className="p-4 space-y-3">
        <Label htmlFor="canEdit">Редактирование</Label>
        <div className="flex items-center gap-3">
          <Input
            id="canEdit"
            type="checkbox"
            checked={canEdit}
            onChange={(event) => onCanEditChange(event.target.checked)}
            className="h-4 w-4"
          />
          <span className="text-sm text-muted-foreground">Пользователь или роль смогут изменять и удалять запись</span>
        </div>
      </Card>
    </div>
  );
}
