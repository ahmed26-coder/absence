# نظام التحقق من الأدوار (Role Detection System)

## 📋 جدول قاعدة البيانات

```sql
create table public.user_roles (
  user_id uuid not null,
  display_name text not null,
  role public.user_role_type not null default 'user'::user_role_type,
  created_at timestamp with time zone null default now(),
  constraint user_roles_pkey primary key (user_id),
  constraint user_roles_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
)
```

## 🔍 كيف يعمل النظام

### 1. الدوال الأساسية في `app/auth/actions.ts`

#### `getUserRole()`
- **الوظيفة**: تجلب دور المستخدم الحالي من جدول `user_roles`
- **الإرجاع**: `"admin"` أو `"user"` أو `null`
- **الاستخدام**: في الـ layouts والصفحات التي تحتاج معرفة الدور

```typescript
const role = await getUserRole()
// role = "admin" | "user" | null
```

#### `isAdmin()`
- **الوظيفة**: تتحقق إذا كان المستخدم الحالي admin
- **الإرجاع**: `true` أو `false`
- **الاستخدام**: في route protection والـ middleware

```typescript
const adminStatus = await isAdmin()
// adminStatus = true | false
```

---

## 📍 أماكن استخدام التحقق من الدور

### 1. **Root Layout** (`app/layout.tsx`)
```typescript
const role = user ? await getUserRole() : "user"
<Navbar user={user} role={role || "user"} profile={profile} />
<BottomNav role={role || "user"} />
```
- يجلب الدور مرة واحدة عند تحميل الصفحة
- يمرره إلى Navbar و BottomNav

### 2. **Navbar** (`components/navbar.tsx`)
```typescript
const isAdmin = role === "admin"
const isStudent = role === "user"

// إخفاء/إظهار الروابط حسب الدور
if (item.adminOnly && !isAdmin) return null
if (item.studentOnly && !isStudent) return null
```
- **روابط Admin**: الدورات، الطلاب، الإحصائيات، الديون
- **روابط Student**: لوحتي، ملف تعريفي، دوراتي، المالية

### 3. **Bottom Navigation** (`components/bottom-nav.tsx`)
```typescript
const isAdmin = role === "admin"
if (item.adminOnly && !isAdmin) return null
```
- نفس منطق الـ Navbar للأجهزة المحمولة

### 4. **Route Protection** (Layouts)

#### Students Routes (`app/students/layout.tsx`)
```typescript
const role = await getUserRole()
if (role !== "admin") {
  redirect("/")
}
```

#### Analytics Routes (`app/analytics/layout.tsx`)
```typescript
const role = await getUserRole()
if (role !== "admin") {
  redirect("/")
}
```

#### Debts Routes (`app/debts/layout.tsx`)
```typescript
const role = await getUserRole()
if (role !== "admin") {
  redirect("/")
}
```

### 5. **OAuth Callback** (`app/auth/callback/route.ts`)
```typescript
const { data: roleData } = await supabase
  .from("user_roles")
  .select("role")
  .eq("user_id", data.user.id)
  .single()

const userRole = roleData?.role || "user"

if (userRole === "admin") {
  redirectPath = "/"
} else {
  redirectPath = profileCompleted ? "/student/dashboard" : "/complete-profile"
}
```
- يوجه Admin إلى الصفحة الرئيسية
- يوجه Users إلى dashboard أو complete-profile

---

## ✅ التحقق من عمل النظام

### الخطوات:

1. **تأكد من وجود سجل في `user_roles`**:
```sql
SELECT * FROM user_roles WHERE user_id = 'your-user-id';
```

2. **تحديث الدور إلى admin**:
```sql
UPDATE user_roles 
SET role = 'admin' 
WHERE user_id = 'your-user-id';
```

3. **سجل خروج ثم سجل دخول مرة أخرى**

4. **تحقق من الـ Console Logs**:
```
🔍 getUserRole: Checking role for user: ...
✅ getUserRole: Found role: admin
👤 getUserRole: Display name: ...
🏠 Layout - Role from getUserRole(): admin
📍 Navbar - Received role prop: admin
📍 Navbar - isAdmin: true
```

5. **تحقق من الـ Navbar**:
- يجب أن تظهر: الدورات، الطلاب، الإحصائيات، الديون
- يجب أن تختفي: لوحتي، ملف تعريفي، دوراتي، المالية

---

## 🐛 استكشاف الأخطاء

### المشكلة: Navbar تعرض روابط Student بدل Admin

**الحل**:
1. تحقق من `user_id` في Console:
```
🏠 Layout - User ID: ...
```

2. تحقق من `user_roles` table:
```sql
SELECT user_id, role, display_name 
FROM user_roles 
WHERE user_id = 'the-id-from-console';
```

3. إذا لم يكن هناك سجل، أضف واحد:
```sql
INSERT INTO user_roles (user_id, display_name, role)
VALUES ('your-user-id', 'Admin Name', 'admin');
```

4. إذا كان الـ `user_id` مختلف، حدّث السجل:
```sql
UPDATE user_roles 
SET user_id = 'correct-user-id' 
WHERE user_id = 'old-user-id';
```

---

## 📝 ملاحظات مهمة

1. **الدور الافتراضي**: إذا لم يوجد سجل في `user_roles`، يعتبر المستخدم `"user"` عادي
2. **OAuth Users**: عند تسجيل الدخول بـ Google، يتم التحقق من الدور في `callback/route.ts`
3. **Server-Side Protection**: جميع الـ admin routes محمية بـ layouts تتحقق من الدور
4. **Client-Side Hiding**: الـ Navbar و BottomNav يخفون الروابط حسب الدور

---

## 🔐 الأمان

- ✅ **Server-Side Protection**: Layouts تمنع الوصول غير المصرح
- ✅ **Client-Side Hiding**: UI يخفي الروابط غير المناسبة
- ✅ **Database Constraints**: Foreign key يضمن صحة `user_id`
- ✅ **Default Role**: المستخدمون الجدد يحصلون على دور `"user"` افتراضيًا
