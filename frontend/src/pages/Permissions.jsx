import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'
import { useAccess } from '../contexts/AccessContext'
import {
    Shield,
    Search,
    Loader2,
    Save,
    Users,
    ShieldCheck,
    Settings,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table'

const API_URL = 'http://localhost:5000/api'

const rolesMeta = [
    { role: 'MASTER_ADMIN', label: 'Master Admin' },
    { role: 'owner', label: 'Owner' },
    { role: 'manager', label: 'Manager' },
    { role: 'employee', label: 'Employee' },
]

const PermissionBadge = ({ active }) => (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${active ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20' : 'bg-muted text-muted-foreground/80 border border-border'}`}>
        {active ? 'Enabled' : 'Disabled'}
    </span>
)

const Permissions = () => {
    const { user } = useAuth()
    const { hasPermission } = useAccess()
    const [roles, setRoles] = useState([])
    const [permissions, setPermissions] = useState([])
    const [filter, setFilter] = useState('')
    const [loading, setLoading] = useState(false)
    const [savingRole, setSavingRole] = useState(null)
    const [error, setError] = useState('')

    const isAuthorized = user?.role === 'MASTER_ADMIN' || hasPermission('canConfigureRoles')

    const permissionHeaders = useMemo(
        () => [
            { key: 'permission', label: 'Permission' },
            ...rolesMeta,
        ],
        []
    )

    useEffect(() => {
        if (!isAuthorized) return
        loadRoleMatrix()
    }, [isAuthorized])

    const getHeaders = () => {
        const token = localStorage.getItem('storetrack_token')
        return {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        }
    }

    const loadRoleMatrix = async () => {
        setLoading(true)
        try {
            const [rolesRes, catalogRes] = await Promise.all([
                fetch(`${API_URL}/permissions/roles`, { headers: getHeaders() }),
                fetch(`${API_URL}/permissions/catalog`, { headers: getHeaders() }),
            ])
            const [rolesData, catalogData] = await Promise.all([rolesRes.json(), catalogRes.json()])

            if (!rolesRes.ok || !catalogRes.ok) {
                throw new Error(rolesData.message || catalogData.message || 'Failed to load permission configuration')
            }

            setRoles(rolesData.roles)
            setPermissions(catalogData)
            setError('')
        } catch (err) {
            setError(err.message || 'Unable to load permissions')
        } finally {
            setLoading(false)
        }
    }

    const filteredPermissions = permissions.filter((permission) =>
        permission.label.toLowerCase().includes(filter.toLowerCase()) ||
        permission.description.toLowerCase().includes(filter.toLowerCase())
    )

    const togglePermission = (roleKey, permissionKey) => {
        setRoles((prevRoles) =>
            prevRoles.map((role) =>
                role.role === roleKey
                    ? {
                          ...role,
                          permissions: {
                              ...role.permissions,
                              [permissionKey]: !role.permissions?.[permissionKey],
                          },
                      }
                    : role
            )
        )
    }

    const saveRolePermissions = async (roleKey) => {
        const roleEntry = roles.find((role) => role.role === roleKey)
        if (!roleEntry) return

        setSavingRole(roleKey)
        try {
            const response = await fetch(`${API_URL}/permissions/roles/${roleKey}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify({ permissions: roleEntry.permissions }),
            })
            const data = await response.json()
            if (!response.ok) {
                throw new Error(data.message || 'Failed to save role permissions')
            }

            setRoles((prevRoles) => prevRoles.map((role) => (role.role === roleKey ? data : role)))
            toast.success(`${roleEntry.label} permissions saved`)
        } catch (err) {
            toast.error(err.message || 'Permission save failed')
        } finally {
            setSavingRole(null)
        }
    }

    if (!user) {
        return null
    }

    if (!isAuthorized) {
        return (
            <div className="mx-auto mt-20 max-w-3xl rounded-3xl border border-destructive/20 bg-destructive/5 p-12 text-center shadow-lg">
                <ShieldCheck className="mx-auto mb-6 h-12 w-12 text-destructive" />
                <h2 className="text-3xl font-bold text-destructive">Restricted Access</h2>
                <p className="mt-3 text-muted-foreground">You do not have configuration rights for role permissions.</p>
            </div>
        )
    }

    return (
        <div className="space-y-10 pb-20 animate-in fade-in duration-500">
            <div className="space-y-3">
                <div className="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-muted-foreground">
                    <Shield className="h-4 w-4 text-primary" />
                    Role-based Access Control
                </div>
                <h1 className="text-4xl font-bold tracking-tight text-foreground">Permission Matrix</h1>
                <p className="max-w-3xl text-base text-muted-foreground">
                    Configure role defaults, manage privacy boundaries, and keep authorization centralized for MASTER_ADMIN, Owner, Manager, and Employee.
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-[1fr_320px]">
                <Card className="border-border bg-card shadow-sm">
                    <CardHeader>
                        <CardTitle>Permission Matrix</CardTitle>
                        <CardDescription>Use search and direct toggles to define role capabilities.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="space-y-2">
                                <p className="text-sm font-semibold text-foreground">Search permissions</p>
                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        value={filter}
                                        onChange={(e) => setFilter(e.target.value)}
                                        placeholder="Filter by permission"
                                        className="w-full rounded-2xl border border-border bg-background py-3 pl-11 pr-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 overflow-auto rounded-3xl border border-border bg-background shadow-sm">
                            <Table className="min-w-[740px]">
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="bg-muted/50">Permission</TableHead>
                                        {rolesMeta.map((roleInfo) => (
                                            <TableHead key={roleInfo.role} className="bg-muted/50 text-center">
                                                {roleInfo.label}
                                            </TableHead>
                                        ))}
                                        <TableHead className="bg-muted/50 text-center">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={rolesMeta.length + 2} className="py-16 text-center text-sm text-muted-foreground">
                                                <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-primary" />
                                                Loading permission matrix...
                                            </TableCell>
                                        </TableRow>
                                    ) : error ? (
                                        <TableRow>
                                            <TableCell colSpan={rolesMeta.length + 2} className="py-16 text-center text-sm text-destructive">
                                                {error}
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredPermissions.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={rolesMeta.length + 2} className="py-16 text-center text-sm text-muted-foreground">
                                                No permissions match your search.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredPermissions.map((permission) => (
                                            <TableRow key={permission.key}>
                                                <TableCell className="font-semibold text-foreground">
                                                    <div className="flex flex-col gap-1">
                                                        <span>{permission.label}</span>
                                                        <span className="text-xs text-muted-foreground">{permission.description}</span>
                                                    </div>
                                                </TableCell>
                                                {roles.map((role) => (
                                                    <TableCell key={`${role.role}-${permission.key}`} className="text-center">
                                                        <button
                                                            onClick={() => togglePermission(role.role, permission.key)}
                                                            className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold transition ${role.permissions?.[permission.key] ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/20' : 'bg-muted text-muted-foreground/80 border border-border'}`}
                                                        >
                                                            {role.permissions?.[permission.key] ? 'Allow' : 'Deny'}
                                                        </button>
                                                    </TableCell>
                                                ))}
                                                <TableCell className="text-center">
                                                    <PermissionBadge active={false} />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="border-border bg-card shadow-sm">
                        <CardHeader>
                            <CardTitle>Role Actions</CardTitle>
                            <CardDescription>Save changes for each role separately.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {roles.map((role) => (
                                <div key={role.role} className="rounded-3xl border border-border bg-background p-5">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">{role.label}</p>
                                            <p className="mt-1 text-base font-bold text-foreground">{role.label}</p>
                                        </div>
                                        <button
                                            disabled={savingRole === role.role}
                                            onClick={() => saveRolePermissions(role.role)}
                                            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {savingRole === role.role ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                            Save
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-card shadow-sm">
                        <CardHeader>
                            <CardTitle>Policy Insights</CardTitle>
                            <CardDescription>Authorization is enforced in both frontend and backend.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="rounded-3xl border border-border p-4 bg-background">
                                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                    <Settings className="h-4 w-4 text-primary" />
                                    Central role policy
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Master Admin and Owner roles always inherit full access. Manager and Employee permissions are evaluated dynamically via the policy matrix.
                                </p>
                            </div>
                            <div className="rounded-3xl border border-border p-4 bg-background">
                                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                    <Users className="h-4 w-4 text-primary" />
                                    Audit-ready configuration
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Permission updates are persisted through the backend API and enforced by reusable authorization middleware.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default Permissions
