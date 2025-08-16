# Configuration Supabase pour PhilSafe

## Policies RLS requises

### Table `users`

Les policies suivantes doivent être créées dans Supabase Dashboard > Authentication > Policies :

#### 1. Policy SELECT
```sql
-- Nom: "Users can view their own profile"
-- Opération: SELECT
-- Expression: auth.uid() = id
```

#### 2. Policy INSERT  
```sql
-- Nom: "Users can create their own profile"
-- Opération: INSERT  
-- Expression: auth.uid() = id
```

#### 3. Policy UPDATE
```sql
-- Nom: "Users can update their own profile"
-- Opération: UPDATE
-- Expression: auth.uid() = id
```

## Alternative : RPC Function

Créer cette fonction dans Supabase Dashboard > Database > Functions :

```sql
CREATE OR REPLACE FUNCTION create_user_profile(
  user_id UUID,
  user_full_name TEXT DEFAULT NULL,
  user_email TEXT DEFAULT NULL,
  user_role TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO users (id, full_name, email, role)
  VALUES (user_id, user_full_name, user_email, user_role::role_type);
EXCEPTION
  WHEN unique_violation THEN
    -- Profile déjà existant, ne rien faire
    NULL;
END;
$$;
```

## Schema de la table `users`

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  role role_type, -- ENUM: 'aidant' | 'intervenant'  
  phone_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activer RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

## Type ENUM pour les rôles

```sql
CREATE TYPE role_type AS ENUM ('aidant', 'intervenant');
```

## Configuration Authentication

### Redirect URLs à configurer dans Supabase Dashboard > Authentication > Settings

1. **Site URL** : `philsafe://auth-callback`
2. **Redirect URLs** : 
   - `philsafe://auth-callback`
   - `https://philsafe.app/auth-callback` (si domaine web)

### Pour le développement local
Ajouter aussi :
- `exp://192.168.1.8:8081` (remplacer par votre IP locale)
- `exp://localhost:8081`

### Problèmes courants
- **Error "access_denied" ou "otp_expired"** : Vérifier que la Site URL est bien configurée
- **Redirection vers localhost:3000** : La Site URL par défaut de Supabase n'est pas mise à jour