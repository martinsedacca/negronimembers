--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 15.8

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: _realtime; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA _realtime;


ALTER SCHEMA _realtime OWNER TO postgres;

--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA auth;


ALTER SCHEMA auth OWNER TO supabase_admin;

--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA extensions;


ALTER SCHEMA extensions OWNER TO postgres;

--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql;


ALTER SCHEMA graphql OWNER TO supabase_admin;

--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA graphql_public;


ALTER SCHEMA graphql_public OWNER TO supabase_admin;

--
-- Name: pg_net; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_net; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_net IS 'Async HTTP';


--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: pgbouncer
--

CREATE SCHEMA pgbouncer;


ALTER SCHEMA pgbouncer OWNER TO pgbouncer;

--
-- Name: pgsodium; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA pgsodium;


ALTER SCHEMA pgsodium OWNER TO supabase_admin;

--
-- Name: pgsodium; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgsodium WITH SCHEMA pgsodium;


--
-- Name: EXTENSION pgsodium; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgsodium IS 'Pgsodium is a modern cryptography library for Postgres.';


--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA realtime;


ALTER SCHEMA realtime OWNER TO supabase_admin;

--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA storage;


ALTER SCHEMA storage OWNER TO supabase_admin;

--
-- Name: supabase_functions; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA supabase_functions;


ALTER SCHEMA supabase_functions OWNER TO supabase_admin;

--
-- Name: supabase_migrations; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA supabase_migrations;


ALTER SCHEMA supabase_migrations OWNER TO postgres;

--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: supabase_admin
--

CREATE SCHEMA vault;


ALTER SCHEMA vault OWNER TO supabase_admin;

--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: pgjwt; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgjwt WITH SCHEMA extensions;


--
-- Name: EXTENSION pgjwt; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgjwt IS 'JSON Web Token API for Postgresql';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


ALTER TYPE auth.aal_level OWNER TO supabase_auth_admin;

--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


ALTER TYPE auth.code_challenge_method OWNER TO supabase_auth_admin;

--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


ALTER TYPE auth.factor_status OWNER TO supabase_auth_admin;

--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


ALTER TYPE auth.factor_type OWNER TO supabase_auth_admin;

--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


ALTER TYPE auth.one_time_token_type OWNER TO supabase_auth_admin;

--
-- Name: action; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


ALTER TYPE realtime.action OWNER TO supabase_admin;

--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


ALTER TYPE realtime.equality_op OWNER TO supabase_admin;

--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


ALTER TYPE realtime.user_defined_filter OWNER TO supabase_admin;

--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


ALTER TYPE realtime.wal_column OWNER TO supabase_admin;

--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: supabase_admin
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


ALTER TYPE realtime.wal_rls OWNER TO supabase_admin;

--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


ALTER FUNCTION auth.email() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


ALTER FUNCTION auth.jwt() OWNER TO supabase_auth_admin;

--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


ALTER FUNCTION auth.role() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: supabase_auth_admin
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


ALTER FUNCTION auth.uid() OWNER TO supabase_auth_admin;

--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: postgres
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_cron_access() OWNER TO postgres;

--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: postgres
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


ALTER FUNCTION extensions.grant_pg_graphql_access() OWNER TO supabase_admin;

--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: postgres
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
    ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

    ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
    ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

    REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
    REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

    GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
  END IF;
END;
$$;


ALTER FUNCTION extensions.grant_pg_net_access() OWNER TO postgres;

--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: postgres
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_ddl_watch() OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


ALTER FUNCTION extensions.pgrst_drop_watch() OWNER TO supabase_admin;

--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: supabase_admin
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


ALTER FUNCTION extensions.set_graphql_placeholder() OWNER TO supabase_admin;

--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: supabase_admin
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: postgres
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    RAISE WARNING 'PgBouncer auth request: %', p_usename;

    RETURN QUERY
    SELECT usename::TEXT, passwd::TEXT FROM pg_catalog.pg_shadow
    WHERE usename = p_usename;
END;
$$;


ALTER FUNCTION pgbouncer.get_auth(p_usename text) OWNER TO postgres;

--
-- Name: get_member_onboarding_status(uuid); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_member_onboarding_status(member_uuid uuid) RETURNS TABLE(total_questions integer, answered_questions integer, required_questions integer, required_answered integer, is_complete boolean, completion_percentage numeric)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER AS total_questions,
    COUNT(mor.id)::INTEGER AS answered_questions,
    COUNT(*) FILTER (WHERE oq.is_required = true)::INTEGER AS required_questions,
    COUNT(mor.id) FILTER (WHERE oq.is_required = true)::INTEGER AS required_answered,
    (COUNT(mor.id) FILTER (WHERE oq.is_required = true) >= COUNT(*) FILTER (WHERE oq.is_required = true)) AS is_complete,
    CASE 
      WHEN COUNT(*) = 0 THEN 0
      ELSE ROUND((COUNT(mor.id)::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)
    END AS completion_percentage
  FROM onboarding_questions oq
  LEFT JOIN member_onboarding_responses mor 
    ON oq.id = mor.question_id AND mor.member_id = member_uuid
  WHERE oq.is_active = true;
END;
$$;


ALTER FUNCTION public.get_member_onboarding_status(member_uuid uuid) OWNER TO postgres;

--
-- Name: get_upcoming_birthdays(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.get_upcoming_birthdays(days_ahead integer DEFAULT 7) RETURNS TABLE(member_id uuid, full_name text, email text, phone_country_code character varying, phone_number character varying, birth_month integer, birth_day integer, days_until_birthday integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.full_name,
    m.email,
    m.phone_country_code,
    m.phone_number,
    m.birth_month,
    m.birth_day,
    CASE
      WHEN make_date(
        EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,
        m.birth_month,
        m.birth_day
      ) >= CURRENT_DATE
      THEN make_date(
        EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,
        m.birth_month,
        m.birth_day
      ) - CURRENT_DATE
      ELSE make_date(
        EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER + 1,
        m.birth_month,
        m.birth_day
      ) - CURRENT_DATE
    END AS days_until_birthday
  FROM members m
  WHERE 
    m.birth_month IS NOT NULL AND 
    m.birth_day IS NOT NULL AND
    m.status = 'active'
  HAVING days_until_birthday <= days_ahead
  ORDER BY days_until_birthday ASC;
END;
$$;


ALTER FUNCTION public.get_upcoming_birthdays(days_ahead integer) OWNER TO postgres;

--
-- Name: reorder_onboarding_question(uuid, integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.reorder_onboarding_question(question_uuid uuid, new_order integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  old_order INTEGER;
BEGIN
  -- Get current order
  SELECT display_order INTO old_order
  FROM onboarding_questions
  WHERE id = question_uuid;

  IF old_order IS NULL THEN
    RAISE EXCEPTION 'Question not found';
  END IF;

  -- If moving down (increasing order number)
  IF new_order > old_order THEN
    UPDATE onboarding_questions
    SET display_order = display_order - 1
    WHERE display_order > old_order 
      AND display_order <= new_order
      AND id != question_uuid;
  -- If moving up (decreasing order number)
  ELSIF new_order < old_order THEN
    UPDATE onboarding_questions
    SET display_order = display_order + 1
    WHERE display_order >= new_order 
      AND display_order < old_order
      AND id != question_uuid;
  END IF;

  -- Update the question's order
  UPDATE onboarding_questions
  SET display_order = new_order
  WHERE id = question_uuid;
END;
$$;


ALTER FUNCTION public.reorder_onboarding_question(question_uuid uuid, new_order integer) OWNER TO postgres;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

--
-- Name: validate_phone_number(character varying, character varying); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.validate_phone_number(country_code character varying, phone_num character varying) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Remove all non-digit characters
  phone_num := REGEXP_REPLACE(phone_num, '[^0-9]', '', 'g');
  
  -- Basic validation
  IF phone_num IS NULL OR LENGTH(phone_num) < 10 THEN
    RETURN FALSE;
  END IF;
  
  -- Country-specific validation
  CASE country_code
    WHEN '+1' THEN -- US/Canada (10 digits)
      RETURN LENGTH(phone_num) = 10;
    WHEN '+52' THEN -- Mexico (10 digits)
      RETURN LENGTH(phone_num) = 10;
    WHEN '+54' THEN -- Argentina (10-13 digits)
      RETURN LENGTH(phone_num) BETWEEN 10 AND 13;
    ELSE
      RETURN LENGTH(phone_num) BETWEEN 10 AND 15;
  END CASE;
END;
$$;


ALTER FUNCTION public.validate_phone_number(country_code character varying, phone_num character varying) OWNER TO postgres;

--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_;

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


ALTER FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) OWNER TO supabase_admin;

--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


ALTER FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) OWNER TO supabase_admin;

--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


ALTER FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) OWNER TO supabase_admin;

--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
    declare
      res jsonb;
    begin
      execute format('select to_jsonb(%L::'|| type_::text || ')', val)  into res;
      return res;
    end
    $$;


ALTER FUNCTION realtime."cast"(val text, type_ regtype) OWNER TO supabase_admin;

--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


ALTER FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) OWNER TO supabase_admin;

--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


ALTER FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) OWNER TO supabase_admin;

--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;


ALTER FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) OWNER TO supabase_admin;

--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


ALTER FUNCTION realtime.quote_wal2json(entity regclass) OWNER TO supabase_admin;

--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  BEGIN
    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (payload, event, topic, private, extension)
    VALUES (payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      RAISE WARNING 'ErrorSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


ALTER FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) OWNER TO supabase_admin;

--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


ALTER FUNCTION realtime.subscription_check_filters() OWNER TO supabase_admin;

--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: supabase_admin
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


ALTER FUNCTION realtime.to_regrole(role_name text) OWNER TO supabase_admin;

--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


ALTER FUNCTION realtime.topic() OWNER TO supabase_realtime_admin;

--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


ALTER FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) OWNER TO supabase_storage_admin;

--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
_filename text;
BEGIN
	select string_to_array(name, '/') into _parts;
	select _parts[array_length(_parts,1)] into _filename;
	-- @todo return the last part instead of 2
	return reverse(split_part(reverse(_filename), '.', 1));
END
$$;


ALTER FUNCTION storage.extension(name text) OWNER TO supabase_storage_admin;

--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


ALTER FUNCTION storage.filename(name text) OWNER TO supabase_storage_admin;

--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[1:array_length(_parts,1)-1];
END
$$;


ALTER FUNCTION storage.foldername(name text) OWNER TO supabase_storage_admin;

--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::int) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


ALTER FUNCTION storage.get_size_by_bucket() OWNER TO supabase_storage_admin;

--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


ALTER FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text) OWNER TO supabase_storage_admin;

--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(name COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                        substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1)))
                    ELSE
                        name
                END AS name, id, metadata, updated_at
            FROM
                storage.objects
            WHERE
                bucket_id = $5 AND
                name ILIKE $1 || ''%'' AND
                CASE
                    WHEN $6 != '''' THEN
                    name COLLATE "C" > $6
                ELSE true END
                AND CASE
                    WHEN $4 != '''' THEN
                        CASE
                            WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                                substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                name COLLATE "C" > $4
                            END
                    ELSE
                        true
                END
            ORDER BY
                name COLLATE "C" ASC) as e order by name COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_token, bucket_id, start_after;
END;
$_$;


ALTER FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text) OWNER TO supabase_storage_admin;

--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


ALTER FUNCTION storage.operation() OWNER TO supabase_storage_admin;

--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
  v_order_by text;
  v_sort_order text;
begin
  case
    when sortcolumn = 'name' then
      v_order_by = 'name';
    when sortcolumn = 'updated_at' then
      v_order_by = 'updated_at';
    when sortcolumn = 'created_at' then
      v_order_by = 'created_at';
    when sortcolumn = 'last_accessed_at' then
      v_order_by = 'last_accessed_at';
    else
      v_order_by = 'name';
  end case;

  case
    when sortorder = 'asc' then
      v_sort_order = 'asc';
    when sortorder = 'desc' then
      v_sort_order = 'desc';
    else
      v_sort_order = 'asc';
  end case;

  v_order_by = v_order_by || ' ' || v_sort_order;

  return query execute
    'with folders as (
       select path_tokens[$1] as folder
       from storage.objects
         where objects.name ilike $2 || $3 || ''%''
           and bucket_id = $4
           and array_length(objects.path_tokens, 1) <> $1
       group by folder
       order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


ALTER FUNCTION storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text) OWNER TO supabase_storage_admin;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: supabase_storage_admin
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


ALTER FUNCTION storage.update_updated_at_column() OWNER TO supabase_storage_admin;

--
-- Name: http_request(); Type: FUNCTION; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE FUNCTION supabase_functions.http_request() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'supabase_functions'
    AS $$
  DECLARE
    request_id bigint;
    payload jsonb;
    url text := TG_ARGV[0]::text;
    method text := TG_ARGV[1]::text;
    headers jsonb DEFAULT '{}'::jsonb;
    params jsonb DEFAULT '{}'::jsonb;
    timeout_ms integer DEFAULT 1000;
  BEGIN
    IF url IS NULL OR url = 'null' THEN
      RAISE EXCEPTION 'url argument is missing';
    END IF;

    IF method IS NULL OR method = 'null' THEN
      RAISE EXCEPTION 'method argument is missing';
    END IF;

    IF TG_ARGV[2] IS NULL OR TG_ARGV[2] = 'null' THEN
      headers = '{"Content-Type": "application/json"}'::jsonb;
    ELSE
      headers = TG_ARGV[2]::jsonb;
    END IF;

    IF TG_ARGV[3] IS NULL OR TG_ARGV[3] = 'null' THEN
      params = '{}'::jsonb;
    ELSE
      params = TG_ARGV[3]::jsonb;
    END IF;

    IF TG_ARGV[4] IS NULL OR TG_ARGV[4] = 'null' THEN
      timeout_ms = 1000;
    ELSE
      timeout_ms = TG_ARGV[4]::integer;
    END IF;

    CASE
      WHEN method = 'GET' THEN
        SELECT http_get INTO request_id FROM net.http_get(
          url,
          params,
          headers,
          timeout_ms
        );
      WHEN method = 'POST' THEN
        payload = jsonb_build_object(
          'old_record', OLD,
          'record', NEW,
          'type', TG_OP,
          'table', TG_TABLE_NAME,
          'schema', TG_TABLE_SCHEMA
        );

        SELECT http_post INTO request_id FROM net.http_post(
          url,
          payload,
          params,
          headers,
          timeout_ms
        );
      ELSE
        RAISE EXCEPTION 'method argument % is invalid', method;
    END CASE;

    INSERT INTO supabase_functions.hooks
      (hook_table_id, hook_name, request_id)
    VALUES
      (TG_RELID, TG_NAME, request_id);

    RETURN NEW;
  END
$$;


ALTER FUNCTION supabase_functions.http_request() OWNER TO supabase_functions_admin;

--
-- Name: secrets_encrypt_secret_secret(); Type: FUNCTION; Schema: vault; Owner: supabase_admin
--

CREATE FUNCTION vault.secrets_encrypt_secret_secret() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
		BEGIN
		        new.secret = CASE WHEN new.secret IS NULL THEN NULL ELSE
			CASE WHEN new.key_id IS NULL THEN NULL ELSE pg_catalog.encode(
			  pgsodium.crypto_aead_det_encrypt(
				pg_catalog.convert_to(new.secret, 'utf8'),
				pg_catalog.convert_to((new.id::text || new.description::text || new.created_at::text || new.updated_at::text)::text, 'utf8'),
				new.key_id::uuid,
				new.nonce
			  ),
				'base64') END END;
		RETURN new;
		END;
		$$;


ALTER FUNCTION vault.secrets_encrypt_secret_secret() OWNER TO supabase_admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: extensions; Type: TABLE; Schema: _realtime; Owner: supabase_admin
--

CREATE TABLE _realtime.extensions (
    id uuid NOT NULL,
    type text,
    settings jsonb,
    tenant_external_id text,
    inserted_at timestamp(0) without time zone NOT NULL,
    updated_at timestamp(0) without time zone NOT NULL
);


ALTER TABLE _realtime.extensions OWNER TO supabase_admin;

--
-- Name: schema_migrations; Type: TABLE; Schema: _realtime; Owner: supabase_admin
--

CREATE TABLE _realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


ALTER TABLE _realtime.schema_migrations OWNER TO supabase_admin;

--
-- Name: tenants; Type: TABLE; Schema: _realtime; Owner: supabase_admin
--

CREATE TABLE _realtime.tenants (
    id uuid NOT NULL,
    name text,
    external_id text,
    jwt_secret text,
    max_concurrent_users integer DEFAULT 200 NOT NULL,
    inserted_at timestamp(0) without time zone NOT NULL,
    updated_at timestamp(0) without time zone NOT NULL,
    max_events_per_second integer DEFAULT 100 NOT NULL,
    postgres_cdc_default text DEFAULT 'postgres_cdc_rls'::text,
    max_bytes_per_second integer DEFAULT 100000 NOT NULL,
    max_channels_per_client integer DEFAULT 100 NOT NULL,
    max_joins_per_second integer DEFAULT 500 NOT NULL,
    suspend boolean DEFAULT false,
    jwt_jwks jsonb,
    notify_private_alpha boolean DEFAULT false,
    private_only boolean DEFAULT false NOT NULL,
    migrations_ran integer DEFAULT 0,
    broadcast_adapter character varying(255) DEFAULT 'gen_rpc'::character varying,
    max_presence_events_per_second integer DEFAULT 10000,
    max_payload_size_in_kb integer DEFAULT 3000
);


ALTER TABLE _realtime.tenants OWNER TO supabase_admin;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


ALTER TABLE auth.audit_log_entries OWNER TO supabase_auth_admin;

--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text NOT NULL,
    code_challenge_method auth.code_challenge_method NOT NULL,
    code_challenge text NOT NULL,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone
);


ALTER TABLE auth.flow_state OWNER TO supabase_auth_admin;

--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.flow_state IS 'stores metadata for pkce logins';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE auth.identities OWNER TO supabase_auth_admin;

--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


ALTER TABLE auth.instances OWNER TO supabase_auth_admin;

--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


ALTER TABLE auth.mfa_amr_claims OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


ALTER TABLE auth.mfa_challenges OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid
);


ALTER TABLE auth.mfa_factors OWNER TO supabase_auth_admin;

--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


ALTER TABLE auth.one_time_tokens OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


ALTER TABLE auth.refresh_tokens OWNER TO supabase_auth_admin;

--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: supabase_auth_admin
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE auth.refresh_tokens_id_seq OWNER TO supabase_auth_admin;

--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: supabase_auth_admin
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


ALTER TABLE auth.saml_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


ALTER TABLE auth.saml_relay_states OWNER TO supabase_auth_admin;

--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


ALTER TABLE auth.schema_migrations OWNER TO supabase_auth_admin;

--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text
);


ALTER TABLE auth.sessions OWNER TO supabase_auth_admin;

--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


ALTER TABLE auth.sso_domains OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


ALTER TABLE auth.sso_providers OWNER TO supabase_auth_admin;

--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: supabase_auth_admin
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


ALTER TABLE auth.users OWNER TO supabase_auth_admin;

--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: applied_promotions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.applied_promotions (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    member_id uuid NOT NULL,
    promotion_id uuid NOT NULL,
    card_usage_id uuid,
    applied_date timestamp with time zone DEFAULT now() NOT NULL,
    discount_amount numeric(10,2),
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.applied_promotions OWNER TO postgres;

--
-- Name: branches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.branches (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    address text,
    city text,
    phone text,
    email text,
    manager_name text,
    is_active boolean DEFAULT true,
    opening_hours jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.branches OWNER TO postgres;

--
-- Name: card_usage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.card_usage (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    member_id uuid NOT NULL,
    usage_date timestamp with time zone DEFAULT now() NOT NULL,
    location text,
    notes text,
    points_earned integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    transaction_id text,
    branch_id uuid
);


ALTER TABLE public.card_usage OWNER TO postgres;

--
-- Name: COLUMN card_usage.transaction_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.card_usage.transaction_id IS 'Unique transaction ID generated by frontend to prevent duplicate submissions';


--
-- Name: branch_stats; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.branch_stats AS
 SELECT b.id,
    b.name,
    b.address,
    b.city,
    b.is_active,
    count(DISTINCT cu.member_id) AS unique_customers,
    count(cu.id) AS total_transactions,
    0 AS total_purchases,
    0 AS total_visits,
    0 AS total_events,
    (0)::numeric AS total_revenue,
    (0)::numeric AS average_purchase,
    count(
        CASE
            WHEN (cu.usage_date >= (now() - '30 days'::interval)) THEN 1
            ELSE NULL::integer
        END) AS transactions_last_30_days,
    (0)::numeric AS revenue_last_30_days,
    max(cu.usage_date) AS last_transaction_date
   FROM (public.branches b
     LEFT JOIN public.card_usage cu ON ((b.id = cu.branch_id)))
  GROUP BY b.id, b.name, b.address, b.city, b.is_active;


ALTER TABLE public.branch_stats OWNER TO postgres;

--
-- Name: card_design_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.card_design_config (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    description text,
    is_default boolean DEFAULT false,
    logo_text text DEFAULT 'Negroni'::text,
    organization_name text DEFAULT 'Negroni Membership'::text,
    colors jsonb DEFAULT '{"gold": {"bg": "rgb(255, 215, 0)", "fg": "rgb(0, 0, 0)", "label": "rgb(0, 0, 0)"}, "basic": {"bg": "rgb(107, 114, 128)", "fg": "rgb(255, 255, 255)", "label": "rgb(255, 255, 255)"}, "silver": {"bg": "rgb(192, 192, 192)", "fg": "rgb(0, 0, 0)", "label": "rgb(0, 0, 0)"}, "platinum": {"bg": "rgb(229, 228, 226)", "fg": "rgb(0, 0, 0)", "label": "rgb(0, 0, 0)"}}'::jsonb,
    header_fields jsonb DEFAULT '[{"key": "membership_type", "label": "TIPO", "source": "membership_type", "transform": "uppercase"}]'::jsonb,
    primary_fields jsonb DEFAULT '[{"key": "member_name", "label": "MIEMBRO", "source": "full_name"}]'::jsonb,
    secondary_fields jsonb DEFAULT '[{"key": "member_number", "label": "NÚMERO", "source": "member_number"}, {"key": "points", "label": "PUNTOS", "source": "points", "changeMessage": "Tus puntos han cambiado a %@"}]'::jsonb,
    auxiliary_fields jsonb DEFAULT '[{"key": "expiry_date", "label": "VENCE", "source": "expiry_date", "dateStyle": "PKDateStyleMedium"}]'::jsonb,
    back_fields jsonb DEFAULT '[{"key": "email", "label": "Email", "source": "email"}, {"key": "phone", "label": "Teléfono", "source": "phone", "optional": true}, {"key": "joined_date", "label": "Miembro desde", "source": "joined_date", "dateStyle": "PKDateStyleMedium"}, {"key": "terms", "label": "Términos y Condiciones", "value": "Esta tarjeta es personal e intransferible. Válida solo para el titular. Para más información visita nuestro sitio web."}]'::jsonb,
    barcode_config jsonb DEFAULT '{"format": "PKBarcodeFormatQR", "messageSource": "member_number", "messageEncoding": "iso-8859-1"}'::jsonb,
    logo_image text,
    icon_image text,
    background_image text,
    strip_image text,
    text_alignment text DEFAULT 'left'::text,
    grouping_identifier text,
    suppress_strip_shine boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.card_design_config OWNER TO postgres;

--
-- Name: event_attendees; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.event_attendees (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    event_id uuid NOT NULL,
    member_id uuid NOT NULL,
    status text DEFAULT 'invited'::text,
    invited_at timestamp with time zone DEFAULT now(),
    attended_at timestamp with time zone,
    notes text,
    CONSTRAINT event_attendees_status_check CHECK ((status = ANY (ARRAY['invited'::text, 'confirmed'::text, 'attended'::text, 'cancelled'::text])))
);


ALTER TABLE public.event_attendees OWNER TO postgres;

--
-- Name: events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.events (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    description text,
    event_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone,
    location text,
    branch_id uuid,
    max_attendees integer,
    points_reward integer DEFAULT 20,
    status text DEFAULT 'upcoming'::text,
    image_url text,
    created_by uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT events_status_check CHECK ((status = ANY (ARRAY['upcoming'::text, 'ongoing'::text, 'completed'::text, 'cancelled'::text])))
);


ALTER TABLE public.events OWNER TO postgres;

--
-- Name: event_stats; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.event_stats AS
 SELECT e.id,
    e.name,
    e.description,
    e.event_date,
    e.end_date,
    e.location,
    e.branch_id,
    e.max_attendees,
    e.points_reward,
    e.status,
    e.image_url,
    e.created_at,
    count(ea.id) AS total_invited,
    count(
        CASE
            WHEN (ea.status = 'confirmed'::text) THEN 1
            ELSE NULL::integer
        END) AS confirmed_count,
    count(
        CASE
            WHEN (ea.status = 'attended'::text) THEN 1
            ELSE NULL::integer
        END) AS attended_count,
    count(
        CASE
            WHEN (ea.status = 'cancelled'::text) THEN 1
            ELSE NULL::integer
        END) AS cancelled_count
   FROM (public.events e
     LEFT JOIN public.event_attendees ea ON ((e.id = ea.event_id)))
  GROUP BY e.id, e.name, e.description, e.event_date, e.end_date, e.location, e.branch_id, e.max_attendees, e.points_reward, e.status, e.image_url, e.created_at;


ALTER TABLE public.event_stats OWNER TO postgres;

--
-- Name: member_onboarding_responses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.member_onboarding_responses (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    member_id uuid NOT NULL,
    question_id uuid NOT NULL,
    response_value text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.member_onboarding_responses OWNER TO postgres;

--
-- Name: TABLE member_onboarding_responses; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.member_onboarding_responses IS 'Member responses to onboarding questions';


--
-- Name: COLUMN member_onboarding_responses.response_value; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.member_onboarding_responses.response_value IS 'Response stored as text. For multi_select, comma-separated values';


--
-- Name: members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.members (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    user_id uuid,
    email text NOT NULL,
    full_name text NOT NULL,
    phone text,
    membership_type text DEFAULT 'basic'::text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    member_number text NOT NULL,
    joined_date timestamp with time zone DEFAULT now() NOT NULL,
    expiry_date timestamp with time zone,
    points integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    phone_country_code character varying(5) DEFAULT '+1'::character varying,
    phone_number character varying(15),
    birth_day integer,
    birth_month integer,
    birth_year integer,
    date_of_birth date GENERATED ALWAYS AS (
CASE
    WHEN ((birth_day IS NOT NULL) AND (birth_month IS NOT NULL) AND (birth_year IS NOT NULL)) THEN make_date(birth_year, birth_month, birth_day)
    ELSE NULL::date
END) STORED,
    ghl_contact_id text,
    CONSTRAINT members_birth_day_check CHECK (((birth_day >= 1) AND (birth_day <= 31))),
    CONSTRAINT members_birth_month_check CHECK (((birth_month >= 1) AND (birth_month <= 12))),
    CONSTRAINT members_birth_year_check CHECK (((birth_year >= 1900) AND ((birth_year)::numeric <= EXTRACT(year FROM CURRENT_DATE)))),
    CONSTRAINT members_status_check CHECK ((status = ANY (ARRAY['active'::text, 'inactive'::text, 'suspended'::text])))
);


ALTER TABLE public.members OWNER TO postgres;

--
-- Name: COLUMN members.phone_country_code; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.members.phone_country_code IS 'Country code for phone number (e.g., +1, +52, +54)';


--
-- Name: COLUMN members.phone_number; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.members.phone_number IS 'Phone number without country code (up to 15 digits)';


--
-- Name: COLUMN members.birth_day; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.members.birth_day IS 'Day of birth (1-31)';


--
-- Name: COLUMN members.birth_month; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.members.birth_month IS 'Month of birth (1-12)';


--
-- Name: COLUMN members.birth_year; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.members.birth_year IS 'Year of birth (1900-current year)';


--
-- Name: COLUMN members.date_of_birth; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.members.date_of_birth IS 'Complete date of birth (auto-generated from day/month/year)';


--
-- Name: COLUMN members.ghl_contact_id; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.members.ghl_contact_id IS 'GoHighLevel contact ID for this member';


--
-- Name: wallet_passes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wallet_passes (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    member_id uuid NOT NULL,
    pass_type text NOT NULL,
    pass_id text NOT NULL,
    serial_number text NOT NULL,
    pass_data jsonb,
    last_updated timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT wallet_passes_pass_type_check CHECK ((pass_type = ANY (ARRAY['apple'::text, 'google'::text])))
);


ALTER TABLE public.wallet_passes OWNER TO postgres;

--
-- Name: member_stats; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.member_stats AS
 SELECT m.id,
    m.full_name,
    m.email,
    m.phone,
    m.membership_type,
    m.status,
    m.member_number,
    m.points,
    m.joined_date,
    m.created_at,
    m.updated_at,
    COALESCE(usage_stats.total_visits, (0)::bigint) AS total_visits,
    COALESCE(usage_stats.total_purchases, (0)::bigint) AS total_purchases,
    COALESCE(usage_stats.total_events, (0)::bigint) AS total_events,
    COALESCE(usage_stats.lifetime_spent, (0)::numeric) AS lifetime_spent,
    COALESCE(usage_stats.visits_last_30_days, (0)::bigint) AS visits_last_30_days,
    COALESCE(usage_stats.spent_last_30_days, (0)::numeric) AS spent_last_30_days,
    COALESCE(usage_stats.visits_last_90_days, (0)::bigint) AS visits_last_90_days,
    COALESCE(usage_stats.spent_last_90_days, (0)::numeric) AS spent_last_90_days,
    usage_stats.last_visit,
    COALESCE(usage_stats.average_purchase, (0)::numeric) AS average_purchase,
    COALESCE(promo_stats.promotions_used, (0)::bigint) AS promotions_used,
    COALESCE(wallet_stats.has_wallet, false) AS has_wallet,
    wallet_stats.wallet_types
   FROM (((public.members m
     LEFT JOIN ( SELECT card_usage.member_id,
            count(*) AS total_visits,
            (0)::bigint AS total_purchases,
            (0)::bigint AS total_events,
            (0)::numeric AS lifetime_spent,
            count(*) FILTER (WHERE (card_usage.usage_date >= (now() - '30 days'::interval))) AS visits_last_30_days,
            (0)::numeric AS spent_last_30_days,
            count(*) FILTER (WHERE (card_usage.usage_date >= (now() - '90 days'::interval))) AS visits_last_90_days,
            (0)::numeric AS spent_last_90_days,
            max(card_usage.usage_date) AS last_visit,
            (0)::numeric AS average_purchase
           FROM public.card_usage
          GROUP BY card_usage.member_id) usage_stats ON ((m.id = usage_stats.member_id)))
     LEFT JOIN ( SELECT applied_promotions.member_id,
            count(DISTINCT applied_promotions.promotion_id) AS promotions_used
           FROM public.applied_promotions
          GROUP BY applied_promotions.member_id) promo_stats ON ((m.id = promo_stats.member_id)))
     LEFT JOIN ( SELECT wallet_passes.member_id,
            (count(*) > 0) AS has_wallet,
            array_agg(wallet_passes.pass_type) AS wallet_types
           FROM public.wallet_passes
          GROUP BY wallet_passes.member_id) wallet_stats ON ((m.id = wallet_stats.member_id)));


ALTER TABLE public.member_stats OWNER TO postgres;

--
-- Name: VIEW member_stats; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON VIEW public.member_stats IS 'Aggregated member statistics with fixed JOIN logic to prevent count multiplication';


--
-- Name: membership_types; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.membership_types (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    description text,
    benefits jsonb,
    price numeric(10,2),
    duration_months integer,
    color text DEFAULT '#000000'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.membership_types OWNER TO postgres;

--
-- Name: onboarding_questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.onboarding_questions (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    question_text text NOT NULL,
    question_type text NOT NULL,
    options jsonb,
    placeholder text,
    is_required boolean DEFAULT false,
    display_order integer NOT NULL,
    is_active boolean DEFAULT true,
    help_text text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT onboarding_questions_question_type_check CHECK ((question_type = ANY (ARRAY['text'::text, 'select'::text, 'multi_select'::text, 'yes_no'::text, 'rating'::text])))
);


ALTER TABLE public.onboarding_questions OWNER TO postgres;

--
-- Name: TABLE onboarding_questions; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.onboarding_questions IS 'Configurable onboarding questions for new members';


--
-- Name: COLUMN onboarding_questions.question_type; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.onboarding_questions.question_type IS 'Type: text, select, multi_select, yes_no, rating';


--
-- Name: COLUMN onboarding_questions.options; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.onboarding_questions.options IS 'JSON array of options for select/multi_select types';


--
-- Name: COLUMN onboarding_questions.display_order; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.onboarding_questions.display_order IS 'Order in which questions are displayed (lower = first)';


--
-- Name: onboarding_response_stats; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.onboarding_response_stats AS
 SELECT oq.id AS question_id,
    oq.question_text,
    oq.question_type,
    oq.display_order,
    count(DISTINCT mor.member_id) AS total_responses,
    count(mor.id) AS response_count,
        CASE
            WHEN (oq.question_type = ANY (ARRAY['select'::text, 'multi_select'::text, 'yes_no'::text])) THEN ( SELECT jsonb_agg(jsonb_build_object('value', value_counts.response_value, 'count', value_counts.response_count) ORDER BY value_counts.response_count DESC) AS jsonb_agg
               FROM ( SELECT mor2.response_value,
                        count(*) AS response_count
                       FROM public.member_onboarding_responses mor2
                      WHERE (mor2.question_id = oq.id)
                      GROUP BY mor2.response_value) value_counts)
            ELSE NULL::jsonb
        END AS response_distribution
   FROM (public.onboarding_questions oq
     LEFT JOIN public.member_onboarding_responses mor ON ((oq.id = mor.question_id)))
  WHERE (oq.is_active = true)
  GROUP BY oq.id, oq.question_text, oq.question_type, oq.display_order
  ORDER BY oq.display_order;


ALTER TABLE public.onboarding_response_stats OWNER TO postgres;

--
-- Name: promotions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promotions (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    title text NOT NULL,
    description text,
    discount_type text NOT NULL,
    discount_value numeric(10,2) NOT NULL,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone NOT NULL,
    min_usage_count integer DEFAULT 0,
    max_usage_count integer,
    applicable_membership_types text[],
    is_active boolean DEFAULT true,
    terms_conditions text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT promotions_discount_type_check CHECK ((discount_type = ANY (ARRAY['percentage'::text, 'fixed'::text, 'points'::text])))
);


ALTER TABLE public.promotions OWNER TO postgres;

--
-- Name: system_config; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_config (
    key text NOT NULL,
    value jsonb NOT NULL,
    description text,
    updated_at timestamp with time zone DEFAULT now(),
    updated_by uuid
);


ALTER TABLE public.system_config OWNER TO postgres;

--
-- Name: TABLE system_config; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.system_config IS 'System-wide configuration including integrations like GoHighLevel';


--
-- Name: wallet_push_notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wallet_push_notifications (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text,
    message text NOT NULL,
    target_type text,
    target_filter jsonb,
    total_sent integer DEFAULT 0,
    total_delivered integer DEFAULT 0,
    total_failed integer DEFAULT 0,
    sent_by uuid,
    sent_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT wallet_push_notifications_target_type_check CHECK ((target_type = ANY (ARRAY['all'::text, 'segment'::text, 'individual'::text, 'tier'::text])))
);


ALTER TABLE public.wallet_push_notifications OWNER TO postgres;

--
-- Name: wallet_push_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.wallet_push_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    pass_id uuid NOT NULL,
    member_id uuid,
    device_library_identifier text NOT NULL,
    push_token text NOT NULL,
    is_active boolean DEFAULT true,
    last_updated_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.wallet_push_tokens OWNER TO postgres;

--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


ALTER TABLE realtime.messages OWNER TO supabase_realtime_admin;

--
-- Name: messages_2025_11_03; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_11_03 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_11_03 OWNER TO supabase_admin;

--
-- Name: messages_2025_11_04; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_11_04 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_11_04 OWNER TO supabase_admin;

--
-- Name: messages_2025_11_05; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_11_05 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_11_05 OWNER TO supabase_admin;

--
-- Name: messages_2025_11_06; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_11_06 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_11_06 OWNER TO supabase_admin;

--
-- Name: messages_2025_11_07; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.messages_2025_11_07 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


ALTER TABLE realtime.messages_2025_11_07 OWNER TO supabase_admin;

--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


ALTER TABLE realtime.schema_migrations OWNER TO supabase_admin;

--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: supabase_admin
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


ALTER TABLE realtime.subscription OWNER TO supabase_admin;

--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text
);


ALTER TABLE storage.buckets OWNER TO supabase_storage_admin;

--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE storage.migrations OWNER TO supabase_storage_admin;

--
-- Name: objects; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb
);


ALTER TABLE storage.objects OWNER TO supabase_storage_admin;

--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: supabase_storage_admin
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb
);


ALTER TABLE storage.s3_multipart_uploads OWNER TO supabase_storage_admin;

--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: supabase_storage_admin
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE storage.s3_multipart_uploads_parts OWNER TO supabase_storage_admin;

--
-- Name: hooks; Type: TABLE; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE TABLE supabase_functions.hooks (
    id bigint NOT NULL,
    hook_table_id integer NOT NULL,
    hook_name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    request_id bigint
);


ALTER TABLE supabase_functions.hooks OWNER TO supabase_functions_admin;

--
-- Name: TABLE hooks; Type: COMMENT; Schema: supabase_functions; Owner: supabase_functions_admin
--

COMMENT ON TABLE supabase_functions.hooks IS 'Supabase Functions Hooks: Audit trail for triggered hooks.';


--
-- Name: hooks_id_seq; Type: SEQUENCE; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE SEQUENCE supabase_functions.hooks_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE supabase_functions.hooks_id_seq OWNER TO supabase_functions_admin;

--
-- Name: hooks_id_seq; Type: SEQUENCE OWNED BY; Schema: supabase_functions; Owner: supabase_functions_admin
--

ALTER SEQUENCE supabase_functions.hooks_id_seq OWNED BY supabase_functions.hooks.id;


--
-- Name: migrations; Type: TABLE; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE TABLE supabase_functions.migrations (
    version text NOT NULL,
    inserted_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE supabase_functions.migrations OWNER TO supabase_functions_admin;

--
-- Name: schema_migrations; Type: TABLE; Schema: supabase_migrations; Owner: postgres
--

CREATE TABLE supabase_migrations.schema_migrations (
    version text NOT NULL,
    statements text[],
    name text
);


ALTER TABLE supabase_migrations.schema_migrations OWNER TO postgres;

--
-- Name: decrypted_secrets; Type: VIEW; Schema: vault; Owner: supabase_admin
--

CREATE VIEW vault.decrypted_secrets AS
 SELECT secrets.id,
    secrets.name,
    secrets.description,
    secrets.secret,
        CASE
            WHEN (secrets.secret IS NULL) THEN NULL::text
            ELSE
            CASE
                WHEN (secrets.key_id IS NULL) THEN NULL::text
                ELSE convert_from(pgsodium.crypto_aead_det_decrypt(decode(secrets.secret, 'base64'::text), convert_to(((((secrets.id)::text || secrets.description) || (secrets.created_at)::text) || (secrets.updated_at)::text), 'utf8'::name), secrets.key_id, secrets.nonce), 'utf8'::name)
            END
        END AS decrypted_secret,
    secrets.key_id,
    secrets.nonce,
    secrets.created_at,
    secrets.updated_at
   FROM vault.secrets;


ALTER TABLE vault.decrypted_secrets OWNER TO supabase_admin;

--
-- Name: messages_2025_11_03; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_11_03 FOR VALUES FROM ('2025-11-03 00:00:00') TO ('2025-11-04 00:00:00');


--
-- Name: messages_2025_11_04; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_11_04 FOR VALUES FROM ('2025-11-04 00:00:00') TO ('2025-11-05 00:00:00');


--
-- Name: messages_2025_11_05; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_11_05 FOR VALUES FROM ('2025-11-05 00:00:00') TO ('2025-11-06 00:00:00');


--
-- Name: messages_2025_11_06; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_11_06 FOR VALUES FROM ('2025-11-06 00:00:00') TO ('2025-11-07 00:00:00');


--
-- Name: messages_2025_11_07; Type: TABLE ATTACH; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_11_07 FOR VALUES FROM ('2025-11-07 00:00:00') TO ('2025-11-08 00:00:00');


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Name: hooks id; Type: DEFAULT; Schema: supabase_functions; Owner: supabase_functions_admin
--

ALTER TABLE ONLY supabase_functions.hooks ALTER COLUMN id SET DEFAULT nextval('supabase_functions.hooks_id_seq'::regclass);


--
-- Data for Name: extensions; Type: TABLE DATA; Schema: _realtime; Owner: supabase_admin
--

COPY _realtime.extensions (id, type, settings, tenant_external_id, inserted_at, updated_at) FROM stdin;
a2dcad91-e55b-4496-9545-7bb110d28fd7	postgres_cdc_rls	{"region": "us-east-1", "db_host": "aPhRJSjYjeBz597LkCRWv3kDBnAs8Mxumj/TZ2hlFQk=", "db_name": "sWBpZNdjggEPTQVlI52Zfw==", "db_port": "+enMDFi1J/3IrrquHHwUmA==", "db_user": "uxbEq/zz8DXVD53TOI1zmw==", "slot_name": "supabase_realtime_replication_slot", "db_password": "sWBpZNdjggEPTQVlI52Zfw==", "publication": "supabase_realtime", "ssl_enforced": false, "poll_interval_ms": 100, "poll_max_changes": 100, "poll_max_record_bytes": 1048576}	realtime-dev	2025-11-04 14:06:19	2025-11-04 14:06:19
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: _realtime; Owner: supabase_admin
--

COPY _realtime.schema_migrations (version, inserted_at) FROM stdin;
20210706140551	2025-11-04 14:06:12
20220329161857	2025-11-04 14:06:12
20220410212326	2025-11-04 14:06:12
20220506102948	2025-11-04 14:06:12
20220527210857	2025-11-04 14:06:12
20220815211129	2025-11-04 14:06:12
20220815215024	2025-11-04 14:06:12
20220818141501	2025-11-04 14:06:12
20221018173709	2025-11-04 14:06:12
20221102172703	2025-11-04 14:06:12
20221223010058	2025-11-04 14:06:12
20230110180046	2025-11-04 14:06:12
20230810220907	2025-11-04 14:06:12
20230810220924	2025-11-04 14:06:12
20231024094642	2025-11-04 14:06:12
20240306114423	2025-11-04 14:06:12
20240418082835	2025-11-04 14:06:12
20240625211759	2025-11-04 14:06:12
20240704172020	2025-11-04 14:06:12
20240902173232	2025-11-04 14:06:12
20241106103258	2025-11-04 14:06:12
20250424203323	2025-11-04 14:06:12
20250613072131	2025-11-04 14:06:12
20250711044927	2025-11-04 14:06:12
20250811121559	2025-11-04 14:06:12
\.


--
-- Data for Name: tenants; Type: TABLE DATA; Schema: _realtime; Owner: supabase_admin
--

COPY _realtime.tenants (id, name, external_id, jwt_secret, max_concurrent_users, inserted_at, updated_at, max_events_per_second, postgres_cdc_default, max_bytes_per_second, max_channels_per_client, max_joins_per_second, suspend, jwt_jwks, notify_private_alpha, private_only, migrations_ran, broadcast_adapter, max_presence_events_per_second, max_payload_size_in_kb) FROM stdin;
92f4f871-0b2b-418a-880f-9d6bc0919ceb	realtime-dev	realtime-dev	iNjicxc4+llvc9wovDvqymwfnj9teWMlyOIbJ8Fh6j2WNU8CIJ2ZgjR6MUIKqSmeDmvpsKLsZ9jgXJmQPpwL8w==	200	2025-11-04 14:06:19	2025-11-04 14:06:19	100	postgres_cdc_rls	100000	100	100	f	\N	t	f	0	gen_rpc	10000	3000
\.


--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at) FROM stdin;
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag) FROM stdin;
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
00000000-0000-0000-0000-000000000000	b3c4171c-7d85-4d64-adb4-89a9e167bcec	authenticated	authenticated	admin@negroni.com	$2a$06$/3iaxjmoaxscKKtiRyBbM.ZbIAHRxvZaA8YARp5VcofYTciAuqVrC	2025-11-04 14:16:41.2451+00	\N		\N		\N			\N	\N	{"provider": "email", "providers": ["email"]}	{}	\N	2025-11-04 14:16:41.2451+00	2025-11-04 14:16:41.2451+00	\N	\N			\N		0	\N		\N	f	\N	f
\.


--
-- Data for Name: key; Type: TABLE DATA; Schema: pgsodium; Owner: supabase_admin
--

COPY pgsodium.key (id, status, created, expires, key_type, key_id, key_context, name, associated_data, raw_key, raw_key_nonce, parent_key, comment, user_data) FROM stdin;
\.


--
-- Data for Name: applied_promotions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.applied_promotions (id, member_id, promotion_id, card_usage_id, applied_date, discount_amount, created_at) FROM stdin;
0f225e89-1a8f-47c4-b63b-8bbc1c4be7b8	10000000-0000-0000-0000-000000000001	20000000-0000-0000-0000-000000000002	\N	2025-10-28 14:26:41.233039+00	\N	2025-11-04 14:26:41.233039+00
f3ad545d-fb01-48e4-bd67-e67b373e408e	10000000-0000-0000-0000-000000000004	20000000-0000-0000-0000-000000000002	\N	2025-10-28 14:26:41.233039+00	\N	2025-11-04 14:26:41.233039+00
d3576b9f-9dc1-4489-a88d-5352be0c8d5e	10000000-0000-0000-0000-000000000003	20000000-0000-0000-0000-000000000002	\N	2025-10-28 14:26:41.233039+00	\N	2025-11-04 14:26:41.233039+00
4d1b4ec1-45af-484d-965b-ff45ff74f9c4	10000000-0000-0000-0000-000000000011	20000000-0000-0000-0000-000000000002	\N	2025-10-28 14:26:41.233039+00	\N	2025-11-04 14:26:41.233039+00
8b92d446-7a06-474f-b75c-f80099905a6f	10000000-0000-0000-0000-000000000007	20000000-0000-0000-0000-000000000002	\N	2025-10-28 14:26:41.233039+00	\N	2025-11-04 14:26:41.233039+00
f1cca8e4-59a8-4fc4-ac4d-f4138a48ddb2	10000000-0000-0000-0000-000000000008	20000000-0000-0000-0000-000000000002	\N	2025-10-28 14:26:41.233039+00	\N	2025-11-04 14:26:41.233039+00
14876c38-519b-4167-bc10-a53acde02cff	10000000-0000-0000-0000-000000000015	20000000-0000-0000-0000-000000000002	\N	2025-10-28 14:26:41.233039+00	\N	2025-11-04 14:26:41.233039+00
f106cfa3-3d78-4ec1-b332-25f26f5a0474	10000000-0000-0000-0000-000000000010	20000000-0000-0000-0000-000000000002	\N	2025-10-28 14:26:41.233039+00	\N	2025-11-04 14:26:41.233039+00
98979e34-f1a9-4d87-8d63-f48d47fcd536	10000000-0000-0000-0000-000000000005	20000000-0000-0000-0000-000000000002	\N	2025-10-28 14:26:41.233039+00	\N	2025-11-04 14:26:41.233039+00
6028b3f9-bc70-4943-9fe6-3e07f035acc7	10000000-0000-0000-0000-000000000009	20000000-0000-0000-0000-000000000002	\N	2025-10-28 14:26:41.233039+00	\N	2025-11-04 14:26:41.233039+00
\.


--
-- Data for Name: branches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.branches (id, name, address, city, phone, email, manager_name, is_active, opening_hours, created_at, updated_at) FROM stdin;
30000000-0000-0000-0000-000000000001	Negroni Doral	8300 NW 53rd St, Doral, FL 33166	Doral	+1 305 555 0100	\N	\N	t	{}	2025-11-04 14:22:01.446418+00	2025-11-04 14:22:01.446418+00
30000000-0000-0000-0000-000000000002	Negroni Brickell	1111 Brickell Ave, Miami, FL 33131	Miami	+1 305 555 0200	\N	\N	t	{}	2025-11-04 14:22:01.446418+00	2025-11-04 14:22:01.446418+00
30000000-0000-0000-0000-000000000003	Negroni Wynwood	2750 NW 3rd Ave, Miami, FL 33127	Miami	+1 305 555 0300	\N	\N	t	{}	2025-11-04 14:22:01.446418+00	2025-11-04 14:22:01.446418+00
\.


--
-- Data for Name: card_design_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.card_design_config (id, name, description, is_default, logo_text, organization_name, colors, header_fields, primary_fields, secondary_fields, auxiliary_fields, back_fields, barcode_config, logo_image, icon_image, background_image, strip_image, text_alignment, grouping_identifier, suppress_strip_shine, created_at, updated_at) FROM stdin;
ca293c35-0ad2-4554-835f-2afb593e08b7	Diseño Predeterminado	Configuración de diseño predeterminada para las tarjetas de membresía	t	Negroni	Negroni Membership	{"gold": {"bg": "rgb(255, 215, 0)", "fg": "rgb(0, 0, 0)", "label": "rgb(0, 0, 0)"}, "basic": {"bg": "rgb(107, 114, 128)", "fg": "rgb(255, 255, 255)", "label": "rgb(255, 255, 255)"}, "silver": {"bg": "rgb(192, 192, 192)", "fg": "rgb(0, 0, 0)", "label": "rgb(0, 0, 0)"}, "platinum": {"bg": "rgb(229, 228, 226)", "fg": "rgb(0, 0, 0)", "label": "rgb(0, 0, 0)"}}	[{"key": "membership_type", "label": "TIPO", "source": "membership_type", "transform": "uppercase"}]	[{"key": "member_name", "label": "MIEMBRO", "source": "full_name"}]	[{"key": "member_number", "label": "NÚMERO", "source": "member_number"}, {"key": "points", "label": "PUNTOS", "source": "points", "changeMessage": "Tus puntos han cambiado a %@"}]	[{"key": "expiry_date", "label": "VENCE", "source": "expiry_date", "dateStyle": "PKDateStyleMedium"}]	[{"key": "email", "label": "Email", "source": "email"}, {"key": "phone", "label": "Teléfono", "source": "phone", "optional": true}, {"key": "joined_date", "label": "Miembro desde", "source": "joined_date", "dateStyle": "PKDateStyleMedium"}, {"key": "terms", "label": "Términos y Condiciones", "value": "Esta tarjeta es personal e intransferible. Válida solo para el titular. Para más información visita nuestro sitio web."}]	{"format": "PKBarcodeFormatQR", "messageSource": "member_number", "messageEncoding": "iso-8859-1"}	\N	\N	\N	\N	left	\N	f	2025-11-04 14:06:20.776046+00	2025-11-04 14:06:20.776046+00
\.


--
-- Data for Name: card_usage; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.card_usage (id, member_id, usage_date, location, notes, points_earned, created_at, transaction_id, branch_id) FROM stdin;
43da0cb9-08a0-4263-921a-2e899787d522	10000000-0000-0000-0000-000000000014	2025-11-01 22:04:02.316515+00	Negroni Doral	Visita de ejemplo	0	2025-11-04 14:24:46.870193+00	\N	\N
af225ea3-3f63-48cd-a148-885ddcd9869d	10000000-0000-0000-0000-000000000009	2025-10-31 22:56:16.449221+00	Negroni Doral	Visita de ejemplo	0	2025-11-04 14:24:46.870193+00	\N	\N
feddde8e-ead4-4bff-8b42-fe72d42553bb	10000000-0000-0000-0000-000000000013	2025-10-27 13:43:24.328929+00	Negroni Doral	Visita de ejemplo	0	2025-11-04 14:24:46.870193+00	\N	\N
edce45f1-ab98-40b0-8abb-2cccb73639ca	10000000-0000-0000-0000-000000000006	2025-10-26 14:05:42.585079+00	Negroni Doral	Visita de ejemplo	0	2025-11-04 14:24:46.870193+00	\N	\N
aec14435-1a39-48e7-b17f-1b2ab7edde6b	10000000-0000-0000-0000-000000000012	2025-10-25 17:14:50.634283+00	Negroni Doral	Visita de ejemplo	0	2025-11-04 14:24:46.870193+00	\N	\N
4719a667-4e6d-482d-b981-80200f508a2e	10000000-0000-0000-0000-000000000015	2025-10-25 02:03:10.296354+00	Negroni Doral	Visita de ejemplo	0	2025-11-04 14:24:46.870193+00	\N	\N
7089972f-de64-4a6b-b67f-59a471fbeca1	10000000-0000-0000-0000-000000000004	2025-10-21 04:20:43.792636+00	Negroni Doral	Visita de ejemplo	0	2025-11-04 14:24:46.870193+00	\N	\N
594a942f-e2cc-4467-a994-e2b7a0eb54be	10000000-0000-0000-0000-000000000005	2025-10-18 16:00:39.339983+00	Negroni Doral	Visita de ejemplo	0	2025-11-04 14:24:46.870193+00	\N	\N
30a36b9f-d7ff-4b48-9135-48f6f9dba450	10000000-0000-0000-0000-000000000002	2025-10-18 09:39:14.905549+00	Negroni Doral	Visita de ejemplo	0	2025-11-04 14:24:46.870193+00	\N	\N
543f193c-c587-4381-ba8e-e6010c7fa84f	10000000-0000-0000-0000-000000000010	2025-10-17 06:57:19.315124+00	Negroni Doral	Visita de ejemplo	0	2025-11-04 14:24:46.870193+00	\N	\N
c65db8f3-79e7-42c1-9751-7519bf978eab	10000000-0000-0000-0000-000000000008	2025-10-14 15:29:51.935555+00	Negroni Doral	Visita de ejemplo	0	2025-11-04 14:24:46.870193+00	\N	\N
fbd88da3-17f6-49f0-9104-c9f03fb259a6	10000000-0000-0000-0000-000000000011	2025-10-10 03:42:54.122064+00	Negroni Doral	Visita de ejemplo	0	2025-11-04 14:24:46.870193+00	\N	\N
fa886d7d-097d-402d-a07c-e78df68c4626	10000000-0000-0000-0000-000000000001	2025-10-09 13:33:29.964456+00	Negroni Doral	Visita de ejemplo	0	2025-11-04 14:24:46.870193+00	\N	\N
127cb120-50aa-4ba3-8875-f911de103f79	10000000-0000-0000-0000-000000000003	2025-10-09 09:27:26.351945+00	Negroni Doral	Visita de ejemplo	0	2025-11-04 14:24:46.870193+00	\N	\N
0d1b963c-b8bf-4139-852a-062996a40aaf	10000000-0000-0000-0000-000000000007	2025-10-07 12:10:07.197659+00	Negroni Doral	Visita de ejemplo	0	2025-11-04 14:24:46.870193+00	\N	\N
512347e3-c106-461f-987a-1fd88c70f28a	10000000-0000-0000-0000-000000000004	2025-10-25 12:22:01.177027+00	Negroni Doral	Visita de ejemplo	0	2025-11-04 14:26:14.997619+00	\N	\N
acabd740-f428-47aa-afc5-2915b0d2297c	10000000-0000-0000-0000-000000000007	2025-10-23 10:45:24.137201+00	Negroni Doral	Visita de ejemplo	0	2025-11-04 14:26:14.997619+00	\N	\N
dcad173e-c270-4d4b-a147-0fcd101394ca	10000000-0000-0000-0000-000000000010	2025-10-23 03:14:39.732608+00	Negroni Doral	Visita de ejemplo	0	2025-11-04 14:26:14.997619+00	\N	\N
78e0f9e1-aec5-48cc-a4e1-ee7fea0e50c1	10000000-0000-0000-0000-000000000015	2025-10-21 05:25:25.846536+00	Negroni Doral	Visita de ejemplo	0	2025-11-04 14:26:14.997619+00	\N	\N
93cb9bfe-de92-4ec0-befb-893ec66527a6	10000000-0000-0000-0000-000000000008	2025-10-21 04:34:59.342879+00	Negroni Doral	Visita de ejemplo	0	2025-11-04 14:26:14.997619+00	\N	\N
341dd83a-443c-4520-a506-1394f07b6a10	10000000-0000-0000-0000-000000000001	2025-10-21 01:31:55.907326+00	Negroni Doral	Visita de ejemplo	0	2025-11-04 14:26:14.997619+00	\N	\N
f312b40a-dd6c-4e02-bdbc-1c9762fcd42b	10000000-0000-0000-0000-000000000005	2025-10-19 07:39:10.79164+00	Negroni Doral	Visita de ejemplo	0	2025-11-04 14:26:14.997619+00	\N	\N
ee1aff92-879d-4b40-8b4a-2c522e53425c	10000000-0000-0000-0000-000000000013	2025-10-14 12:07:52.315191+00	Negroni Doral	Visita de ejemplo	0	2025-11-04 14:26:14.997619+00	\N	\N
d2f5db01-ac86-45fc-9544-a69e587fd26d	10000000-0000-0000-0000-000000000009	2025-10-13 15:49:14.141773+00	Negroni Doral	Visita de ejemplo	0	2025-11-04 14:26:14.997619+00	\N	\N
be6c9336-c8fb-45d0-829a-4e76f90f4bd7	10000000-0000-0000-0000-000000000006	2025-10-12 06:26:38.486173+00	Negroni Doral	Visita de ejemplo	0	2025-11-04 14:26:14.997619+00	\N	\N
f55f23b0-c947-4800-8a68-a2040115aaee	10000000-0000-0000-0000-000000000002	2025-10-10 00:20:12.506956+00	Negroni Doral	Visita de ejemplo	0	2025-11-04 14:26:14.997619+00	\N	\N
e05c91b1-b093-45ad-8f89-a6600cd89c42	10000000-0000-0000-0000-000000000014	2025-10-08 03:55:11.237343+00	Negroni Doral	Visita de ejemplo	0	2025-11-04 14:26:14.997619+00	\N	\N
f61067fb-4694-4fae-935c-d6da4bdaad3f	10000000-0000-0000-0000-000000000011	2025-10-07 10:39:44.196882+00	Negroni Doral	Visita de ejemplo	0	2025-11-04 14:26:14.997619+00	\N	\N
323e8dd8-2000-434b-a314-aa6ca3dc7860	10000000-0000-0000-0000-000000000003	2025-10-06 13:04:54.703162+00	Negroni Doral	Visita de ejemplo	0	2025-11-04 14:26:14.997619+00	\N	\N
9ac2bd4c-d511-4156-88f9-94a3c86405ea	10000000-0000-0000-0000-000000000012	2025-10-06 07:44:16.108298+00	Negroni Doral	Visita de ejemplo	0	2025-11-04 14:26:14.997619+00	\N	\N
b04e2acb-30c3-45ce-b767-9bc1052bc08d	10000000-0000-0000-0000-000000000012	2025-11-03 03:26:23.399027+00	Negroni Doral	Visita de ejemplo	0	2025-11-04 14:26:41.231532+00	\N	\N
c8d4ec43-403d-46b7-b4e1-346cff8a28a2	10000000-0000-0000-0000-000000000006	2025-11-01 01:23:08.001897+00	Negroni Doral	Visita de ejemplo	0	2025-11-04 14:26:41.231532+00	\N	\N
d895c3e3-a5d1-40bd-af78-2c38dd0c67c0	10000000-0000-0000-0000-000000000007	2025-10-29 20:22:11.387582+00	Negroni Doral	Visita de ejemplo	0	2025-11-04 14:26:41.231532+00	\N	\N
84581320-8e90-45cb-a5a4-14f2371364c0	10000000-0000-0000-0000-000000000003	2025-10-28 10:54:00.558501+00	Negroni Doral	Visita de ejemplo	0	2025-11-04 14:26:41.231532+00	\N	\N
07a38907-e7ae-470b-94db-92e9caa80bbb	10000000-0000-0000-0000-000000000015	2025-10-28 09:24:59.225728+00	Negroni Doral	Visita de ejemplo	0	2025-11-04 14:26:41.231532+00	\N	\N
aa6e4d5a-d4f9-45b6-85c6-c537db959217	10000000-0000-0000-0000-000000000004	2025-10-27 14:12:44.646334+00	Negroni Doral	Visita de ejemplo	0	2025-11-04 14:26:41.231532+00	\N	\N
b2426406-830a-4d60-afbd-b32ab1f00a7f	10000000-0000-0000-0000-000000000011	2025-10-24 06:31:12.813642+00	Negroni Doral	Visita de ejemplo	0	2025-11-04 14:26:41.231532+00	\N	\N
1dead2f2-e015-4057-a4de-8301304e1a8e	10000000-0000-0000-0000-000000000013	2025-10-21 12:10:10.15991+00	Negroni Doral	Visita de ejemplo	0	2025-11-04 14:26:41.231532+00	\N	\N
a1691deb-2c4d-44fb-bfbc-dafe191bd75b	10000000-0000-0000-0000-000000000001	2025-10-20 19:37:47.776392+00	Negroni Doral	Visita de ejemplo	0	2025-11-04 14:26:41.231532+00	\N	\N
eabf7187-2928-47ec-b55f-948ebd9af9f5	10000000-0000-0000-0000-000000000010	2025-10-20 12:02:58.841916+00	Negroni Doral	Visita de ejemplo	0	2025-11-04 14:26:41.231532+00	\N	\N
e23cd174-1be1-4aea-aa56-2e625cf8fd3a	10000000-0000-0000-0000-000000000002	2025-10-18 12:34:44.790404+00	Negroni Doral	Visita de ejemplo	0	2025-11-04 14:26:41.231532+00	\N	\N
8534005d-bdb7-42a8-a52c-154495df7401	10000000-0000-0000-0000-000000000005	2025-10-15 04:08:33.290973+00	Negroni Doral	Visita de ejemplo	0	2025-11-04 14:26:41.231532+00	\N	\N
11993b89-1939-42b2-b6f7-ad46a1e36041	10000000-0000-0000-0000-000000000009	2025-10-14 09:11:37.843278+00	Negroni Doral	Visita de ejemplo	0	2025-11-04 14:26:41.231532+00	\N	\N
c13ad784-89d4-4d74-8e06-e179625bc7ea	10000000-0000-0000-0000-000000000008	2025-10-11 18:38:01.723044+00	Negroni Doral	Visita de ejemplo	0	2025-11-04 14:26:41.231532+00	\N	\N
61d25a1f-f576-4a99-927f-4001026b38fd	10000000-0000-0000-0000-000000000014	2025-10-08 18:14:26.860478+00	Negroni Doral	Visita de ejemplo	0	2025-11-04 14:26:41.231532+00	\N	\N
\.


--
-- Data for Name: event_attendees; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.event_attendees (id, event_id, member_id, status, invited_at, attended_at, notes) FROM stdin;
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.events (id, name, description, event_date, end_date, location, branch_id, max_attendees, points_reward, status, image_url, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: member_onboarding_responses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.member_onboarding_responses (id, member_id, question_id, response_value, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.members (id, user_id, email, full_name, phone, membership_type, status, member_number, joined_date, expiry_date, points, created_at, updated_at, phone_country_code, phone_number, birth_day, birth_month, birth_year, ghl_contact_id) FROM stdin;
10000000-0000-0000-0000-000000000001	\N	maria.garcia@email.com	María García	+13051234567	Standard	active	M001	2025-05-04 14:24:46.868712+00	\N	150	2025-11-04 14:24:46.868712+00	2025-11-04 14:24:46.868712+00	+1	3051234567	15	3	1990	\N
10000000-0000-0000-0000-000000000002	\N	carlos.rodriguez@email.com	Carlos Rodríguez	+13051234568	Premium	active	M002	2024-11-04 14:24:46.868712+00	\N	320	2025-11-04 14:24:46.868712+00	2025-11-04 14:24:46.868712+00	+1	3051234568	22	7	1985	\N
10000000-0000-0000-0000-000000000003	\N	ana.martinez@email.com	Ana Martínez	+13051234569	VIP	active	M003	2023-11-04 14:24:46.868712+00	\N	580	2025-11-04 14:24:46.868712+00	2025-11-04 14:24:46.868712+00	+1	3051234569	10	12	1988	\N
10000000-0000-0000-0000-000000000004	\N	luis.fernandez@email.com	Luis Fernández	+13051234570	Standard	active	M004	2025-08-04 14:24:46.868712+00	\N	95	2025-11-04 14:24:46.868712+00	2025-11-04 14:24:46.868712+00	+1	3051234570	5	5	1995	\N
10000000-0000-0000-0000-000000000005	\N	carmen.lopez@email.com	Carmen López	+13051234571	Premium	active	M005	2025-03-04 14:24:46.868712+00	\N	245	2025-11-04 14:24:46.868712+00	2025-11-04 14:24:46.868712+00	+1	3051234571	18	9	1992	\N
10000000-0000-0000-0000-000000000006	\N	jose.sanchez@email.com	José Sánchez	+13051234572	Standard	active	M006	2025-07-04 14:24:46.868712+00	\N	120	2025-11-04 14:24:46.868712+00	2025-11-04 14:24:46.868712+00	+1	3051234572	30	1	1987	\N
10000000-0000-0000-0000-000000000007	\N	laura.perez@email.com	Laura Pérez	+13051234573	VIP	active	M007	2022-11-04 14:24:46.868712+00	\N	720	2025-11-04 14:24:46.868712+00	2025-11-04 14:24:46.868712+00	+1	3051234573	25	6	1991	\N
10000000-0000-0000-0000-000000000008	\N	miguel.torres@email.com	Miguel Torres	+13051234574	Premium	active	M008	2024-11-04 14:24:46.868712+00	\N	410	2025-11-04 14:24:46.868712+00	2025-11-04 14:24:46.868712+00	+1	3051234574	12	11	1989	\N
10000000-0000-0000-0000-000000000009	\N	isabel.ramirez@email.com	Isabel Ramírez	+13051234575	Standard	active	M009	2025-09-04 14:24:46.868712+00	\N	85	2025-11-04 14:24:46.868712+00	2025-11-04 14:24:46.868712+00	+1	3051234575	8	4	1993	\N
10000000-0000-0000-0000-000000000010	\N	diego.flores@email.com	Diego Flores	+13051234576	Premium	active	M010	2025-01-04 14:24:46.868712+00	\N	290	2025-11-04 14:24:46.868712+00	2025-11-04 14:24:46.868712+00	+1	3051234576	20	8	1986	\N
10000000-0000-0000-0000-000000000011	\N	patricia.morales@email.com	Patricia Morales	+13051234577	VIP	active	M011	2021-11-04 14:24:46.868712+00	\N	890	2025-11-04 14:24:46.868712+00	2025-11-04 14:24:46.868712+00	+1	3051234577	14	2	1984	\N
10000000-0000-0000-0000-000000000012	\N	roberto.castro@email.com	Roberto Castro	+13051234578	Standard	active	M012	2025-06-04 14:24:46.868712+00	\N	110	2025-11-04 14:24:46.868712+00	2025-11-04 14:24:46.868712+00	+1	3051234578	3	10	1994	\N
10000000-0000-0000-0000-000000000013	\N	sofia.ruiz@email.com	Sofía Ruiz	+13051234579	Premium	active	M013	2024-11-04 14:24:46.868712+00	\N	355	2025-11-04 14:24:46.868712+00	2025-11-04 14:24:46.868712+00	+1	3051234579	27	7	1990	\N
10000000-0000-0000-0000-000000000014	\N	fernando.diaz@email.com	Fernando Díaz	+13051234580	Standard	active	M014	2025-10-04 14:24:46.868712+00	\N	65	2025-11-04 14:24:46.868712+00	2025-11-04 14:24:46.868712+00	+1	3051234580	16	3	1996	\N
10000000-0000-0000-0000-000000000015	\N	elena.vargas@email.com	Elena Vargas	+13051234581	VIP	active	M015	2020-11-04 14:24:46.868712+00	\N	1050	2025-11-04 14:24:46.868712+00	2025-11-04 14:24:46.868712+00	+1	3051234581	9	12	1983	\N
\.


--
-- Data for Name: membership_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.membership_types (id, name, description, benefits, price, duration_months, color, created_at, updated_at) FROM stdin;
26e47864-bb33-474c-8ffb-35fba32b2888	Basic	Membresía básica con beneficios estándar	{"benefits": ["Acceso básico", "10% descuento", "Acumulación de puntos"]}	0.00	12	#6B7280	2025-11-04 14:06:20.6964+00	2025-11-04 14:06:20.6964+00
51149d4e-94f4-44f9-803a-6692e04e86a6	Silver	Membresía Silver con beneficios mejorados	{"benefits": ["Acceso prioritario", "15% descuento", "Doble puntos", "Promociones exclusivas"]}	49.99	12	#C0C0C0	2025-11-04 14:06:20.6964+00	2025-11-04 14:06:20.6964+00
33032e19-3f13-4fca-9670-a578a0e27012	Gold	Membresía Gold premium	{"benefits": ["Acceso VIP", "20% descuento", "Triple puntos", "Promociones exclusivas", "Eventos especiales"]}	99.99	12	#FFD700	2025-11-04 14:06:20.6964+00	2025-11-04 14:06:20.6964+00
866330c7-bc7e-40f8-b017-2374626512ad	Platinum	Membresía Platinum de élite	{"benefits": ["Acceso ilimitado", "30% descuento", "Cuádruple puntos", "Todas las promociones", "Eventos VIP", "Atención personalizada"]}	199.99	12	#E5E4E2	2025-11-04 14:06:20.6964+00	2025-11-04 14:06:20.6964+00
00000000-0000-0000-0000-000000000001	Standard	Membresía básica con beneficios esenciales	["10% descuento en café", "Acceso a eventos especiales"]	0.00	\N	#F97316	2025-11-04 14:24:46.867614+00	2025-11-04 14:24:46.867614+00
00000000-0000-0000-0000-000000000002	Premium	Membresía premium con beneficios exclusivos	["20% descuento en todo", "Café gratis en cumpleaños", "Invitaciones VIP"]	99.00	\N	#8B5CF6	2025-11-04 14:24:46.867614+00	2025-11-04 14:24:46.867614+00
00000000-0000-0000-0000-000000000003	VIP	Membresía VIP con máximos beneficios	["30% descuento en todo", "Café gratis mensual", "Eventos privados", "Prioridad en reservas"]	299.00	\N	#EAB308	2025-11-04 14:24:46.867614+00	2025-11-04 14:24:46.867614+00
\.


--
-- Data for Name: onboarding_questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.onboarding_questions (id, question_text, question_type, options, placeholder, is_required, display_order, is_active, help_text, created_at, updated_at) FROM stdin;
8de76822-1db7-4c91-91b0-2aeb0db37bea	What's your favorite drink?	select	["Coffee", "Tea", "Juice", "Smoothie", "Other"]	\N	t	1	t	\N	2025-11-04 14:06:20.758999+00	2025-11-04 14:06:20.758999+00
a9a712a4-9b26-4684-82eb-c510da53e514	What do you like to do?	multi_select	["Work", "Study", "Read", "Meet friends", "Relax"]	\N	t	2	t	\N	2025-11-04 14:06:20.758999+00	2025-11-04 14:06:20.758999+00
b8298850-f9f0-41c8-b896-7b3fdd2ba790	Do you have any dietary restrictions?	yes_no	["Yes", "No"]	\N	f	3	t	\N	2025-11-04 14:06:20.758999+00	2025-11-04 14:06:20.758999+00
2ecca7fe-6e9a-4ced-901c-7492901288fa	How would you rate your coffee knowledge?	rating	\N	\N	f	4	t	\N	2025-11-04 14:06:20.758999+00	2025-11-04 14:06:20.758999+00
\.


--
-- Data for Name: promotions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotions (id, title, description, discount_type, discount_value, start_date, end_date, min_usage_count, max_usage_count, applicable_membership_types, is_active, terms_conditions, created_at, updated_at) FROM stdin;
20000000-0000-0000-0000-000000000001	Café Gratis en Cumpleaños	Recibe un café gratis el día de tu cumpleaños	percentage	100.00	2024-11-04 14:26:41.230527+00	2035-11-04 14:26:41.230527+00	0	\N	\N	t	Válido solo el día de tu cumpleaños. No acumulable.	2025-11-04 14:26:41.230527+00	2025-11-04 14:26:41.230527+00
20000000-0000-0000-0000-000000000002	20% Descuento Café	Descuento en cualquier café del menú	percentage	20.00	2025-05-04 14:26:41.230527+00	2026-05-04 14:26:41.230527+00	0	\N	\N	t	Válido en café regular o especial. No incluye bebidas frías.	2025-11-04 14:26:41.230527+00	2025-11-04 14:26:41.230527+00
20000000-0000-0000-0000-000000000003	Desayuno Especial	Descuento en desayuno completo	percentage	15.00	2025-08-04 14:26:41.230527+00	2026-02-04 14:26:41.230527+00	0	\N	\N	t	Válido de 7am a 11am. No acumulable con otras promociones.	2025-11-04 14:26:41.230527+00	2025-11-04 14:26:41.230527+00
\.


--
-- Data for Name: system_config; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.system_config (key, value, description, updated_at, updated_by) FROM stdin;
points_rules	{"per_visit": 10, "per_dollar_spent": 1, "per_event_attended": 20}	Reglas de acumulación de puntos	2025-11-04 14:06:20.72661+00	\N
tier_thresholds	{"Gold": {"min_spent": 2000, "min_visits": 50}, "Basic": {"min_spent": 0, "min_visits": 0}, "Silver": {"min_spent": 500, "min_visits": 20}, "Platinum": {"min_spent": 5000, "min_visits": 100}}	Umbrales para cambio de tier automático	2025-11-04 14:06:20.72661+00	\N
ghl_webhook_url	""	GoHighLevel webhook URL para enviar tarjetas digitales a clientes	2025-11-04 14:06:20.730273+00	\N
\.


--
-- Data for Name: wallet_passes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.wallet_passes (id, member_id, pass_type, pass_id, serial_number, pass_data, last_updated, created_at) FROM stdin;
\.


--
-- Data for Name: wallet_push_notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.wallet_push_notifications (id, title, message, target_type, target_filter, total_sent, total_delivered, total_failed, sent_by, sent_at, created_at) FROM stdin;
\.


--
-- Data for Name: wallet_push_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.wallet_push_tokens (id, pass_id, member_id, device_library_identifier, push_token, is_active, last_updated_at, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: messages_2025_11_03; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_11_03 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_11_04; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_11_04 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_11_05; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_11_05 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_11_06; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_11_06 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_11_07; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.messages_2025_11_07 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2025-11-04 14:06:13
20211116045059	2025-11-04 14:06:13
20211116050929	2025-11-04 14:06:13
20211116051442	2025-11-04 14:06:13
20211116212300	2025-11-04 14:06:13
20211116213355	2025-11-04 14:06:13
20211116213934	2025-11-04 14:06:13
20211116214523	2025-11-04 14:06:13
20211122062447	2025-11-04 14:06:13
20211124070109	2025-11-04 14:06:13
20211202204204	2025-11-04 14:06:13
20211202204605	2025-11-04 14:06:13
20211210212804	2025-11-04 14:06:13
20211228014915	2025-11-04 14:06:13
20220107221237	2025-11-04 14:06:13
20220228202821	2025-11-04 14:06:13
20220312004840	2025-11-04 14:06:13
20220603231003	2025-11-04 14:06:13
20220603232444	2025-11-04 14:06:13
20220615214548	2025-11-04 14:06:13
20220712093339	2025-11-04 14:06:13
20220908172859	2025-11-04 14:06:13
20220916233421	2025-11-04 14:06:13
20230119133233	2025-11-04 14:06:13
20230128025114	2025-11-04 14:06:13
20230128025212	2025-11-04 14:06:13
20230227211149	2025-11-04 14:06:13
20230228184745	2025-11-04 14:06:13
20230308225145	2025-11-04 14:06:13
20230328144023	2025-11-04 14:06:13
20231018144023	2025-11-04 14:06:13
20231204144023	2025-11-04 14:06:13
20231204144024	2025-11-04 14:06:13
20231204144025	2025-11-04 14:06:13
20240108234812	2025-11-04 14:06:13
20240109165339	2025-11-04 14:06:13
20240227174441	2025-11-04 14:06:13
20240311171622	2025-11-04 14:06:13
20240321100241	2025-11-04 14:06:13
20240401105812	2025-11-04 14:06:13
20240418121054	2025-11-04 14:06:13
20240523004032	2025-11-04 14:06:13
20240618124746	2025-11-04 14:06:13
20240801235015	2025-11-04 14:06:13
20240805133720	2025-11-04 14:06:13
20240827160934	2025-11-04 14:06:13
20240919163303	2025-11-04 14:06:13
20240919163305	2025-11-04 14:06:13
20241019105805	2025-11-04 14:06:13
20241030150047	2025-11-04 14:06:13
20241108114728	2025-11-04 14:06:13
20241121104152	2025-11-04 14:06:13
20241130184212	2025-11-04 14:06:13
20241220035512	2025-11-04 14:06:13
20241220123912	2025-11-04 14:06:13
20241224161212	2025-11-04 14:06:13
20250107150512	2025-11-04 14:06:13
20250110162412	2025-11-04 14:06:13
20250123174212	2025-11-04 14:06:13
20250128220012	2025-11-04 14:06:13
20250506224012	2025-11-04 14:06:13
20250523164012	2025-11-04 14:06:13
20250714121412	2025-11-04 14:06:13
20250905041441	2025-11-04 14:06:13
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: supabase_admin
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at) FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2025-11-04 14:06:20.250526
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2025-11-04 14:06:20.252235
2	storage-schema	5c7968fd083fcea04050c1b7f6253c9771b99011	2025-11-04 14:06:20.25307
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2025-11-04 14:06:20.256999
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2025-11-04 14:06:20.262058
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2025-11-04 14:06:20.262963
6	change-column-name-in-get-size	f93f62afdf6613ee5e7e815b30d02dc990201044	2025-11-04 14:06:20.264217
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2025-11-04 14:06:20.265242
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2025-11-04 14:06:20.265943
9	fix-search-function	3a0af29f42e35a4d101c259ed955b67e1bee6825	2025-11-04 14:06:20.266829
10	search-files-search-function	68dc14822daad0ffac3746a502234f486182ef6e	2025-11-04 14:06:20.267954
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2025-11-04 14:06:20.269086
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2025-11-04 14:06:20.27009
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2025-11-04 14:06:20.270877
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2025-11-04 14:06:20.271789
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2025-11-04 14:06:20.2778
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2025-11-04 14:06:20.278657
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2025-11-04 14:06:20.279492
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2025-11-04 14:06:20.28049
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2025-11-04 14:06:20.281676
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2025-11-04 14:06:20.282517
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2025-11-04 14:06:20.284263
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2025-11-04 14:06:20.291289
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2025-11-04 14:06:20.296095
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2025-11-04 14:06:20.297174
25	custom-metadata	67eb93b7e8d401cafcdc97f9ac779e71a79bfe03	2025-11-04 14:06:20.297972
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- Data for Name: hooks; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--

COPY supabase_functions.hooks (id, hook_table_id, hook_name, created_at, request_id) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--

COPY supabase_functions.migrations (version, inserted_at) FROM stdin;
initial	2025-11-04 14:06:09.24721+00
20210809183423_update_grants	2025-11-04 14:06:09.24721+00
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: supabase_migrations; Owner: postgres
--

COPY supabase_migrations.schema_migrations (version, statements, name) FROM stdin;
20250111	{"-- Enable UUID extension\nCREATE EXTENSION IF NOT EXISTS \\"uuid-ossp\\"","-- Create members table\nCREATE TABLE IF NOT EXISTS public.members (\n    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\n    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,\n    email TEXT NOT NULL UNIQUE,\n    full_name TEXT NOT NULL,\n    phone TEXT,\n    membership_type TEXT NOT NULL DEFAULT 'basic',\n    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),\n    member_number TEXT UNIQUE NOT NULL,\n    joined_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),\n    expiry_date TIMESTAMPTZ,\n    points INTEGER DEFAULT 0,\n    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),\n    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()\n)","-- Create memberships table (membership types/tiers)\nCREATE TABLE IF NOT EXISTS public.membership_types (\n    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\n    name TEXT NOT NULL UNIQUE,\n    description TEXT,\n    benefits JSONB,\n    price DECIMAL(10, 2),\n    duration_months INTEGER,\n    color TEXT DEFAULT '#000000',\n    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),\n    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()\n)","-- Create promotions table\nCREATE TABLE IF NOT EXISTS public.promotions (\n    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\n    title TEXT NOT NULL,\n    description TEXT,\n    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed', 'points')),\n    discount_value DECIMAL(10, 2) NOT NULL,\n    start_date TIMESTAMPTZ NOT NULL,\n    end_date TIMESTAMPTZ NOT NULL,\n    min_usage_count INTEGER DEFAULT 0,\n    max_usage_count INTEGER,\n    applicable_membership_types TEXT[],\n    is_active BOOLEAN DEFAULT true,\n    terms_conditions TEXT,\n    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),\n    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()\n)","-- Create card_usage table (track when members use their cards)\nCREATE TABLE IF NOT EXISTS public.card_usage (\n    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\n    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,\n    usage_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),\n    location TEXT,\n    notes TEXT,\n    points_earned INTEGER DEFAULT 0,\n    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()\n)","-- Create applied_promotions table (track which promotions were applied)\nCREATE TABLE IF NOT EXISTS public.applied_promotions (\n    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\n    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,\n    promotion_id UUID NOT NULL REFERENCES public.promotions(id) ON DELETE CASCADE,\n    card_usage_id UUID REFERENCES public.card_usage(id) ON DELETE SET NULL,\n    applied_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),\n    discount_amount DECIMAL(10, 2),\n    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()\n)","-- Create wallet_passes table (store Apple/Google Wallet pass data)\nCREATE TABLE IF NOT EXISTS public.wallet_passes (\n    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\n    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,\n    pass_type TEXT NOT NULL CHECK (pass_type IN ('apple', 'google')),\n    pass_id TEXT NOT NULL UNIQUE,\n    serial_number TEXT NOT NULL,\n    pass_data JSONB,\n    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),\n    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()\n)","-- Create indexes for better performance\nCREATE INDEX idx_members_user_id ON public.members(user_id)","CREATE INDEX idx_members_email ON public.members(email)","CREATE INDEX idx_members_member_number ON public.members(member_number)","CREATE INDEX idx_members_status ON public.members(status)","CREATE INDEX idx_card_usage_member_id ON public.card_usage(member_id)","CREATE INDEX idx_card_usage_date ON public.card_usage(usage_date)","CREATE INDEX idx_applied_promotions_member_id ON public.applied_promotions(member_id)","CREATE INDEX idx_applied_promotions_promotion_id ON public.applied_promotions(promotion_id)","CREATE INDEX idx_wallet_passes_member_id ON public.wallet_passes(member_id)","CREATE INDEX idx_promotions_dates ON public.promotions(start_date, end_date)","-- Create function to update updated_at timestamp\nCREATE OR REPLACE FUNCTION update_updated_at_column()\nRETURNS TRIGGER AS $$\nBEGIN\n    NEW.updated_at = NOW();\n    RETURN NEW;\nEND;\n$$ LANGUAGE plpgsql","-- Create triggers for updated_at\nCREATE TRIGGER update_members_updated_at BEFORE UPDATE ON public.members\n    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()","CREATE TRIGGER update_membership_types_updated_at BEFORE UPDATE ON public.membership_types\n    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()","CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON public.promotions\n    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()","-- Enable Row Level Security (RLS)\nALTER TABLE public.members ENABLE ROW LEVEL SECURITY","ALTER TABLE public.membership_types ENABLE ROW LEVEL SECURITY","ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY","ALTER TABLE public.card_usage ENABLE ROW LEVEL SECURITY","ALTER TABLE public.applied_promotions ENABLE ROW LEVEL SECURITY","ALTER TABLE public.wallet_passes ENABLE ROW LEVEL SECURITY","-- RLS Policies for members (authenticated users can manage all members - admin dashboard)\nCREATE POLICY \\"Authenticated users can view all members\\" ON public.members\n    FOR SELECT USING (auth.role() = 'authenticated')","CREATE POLICY \\"Authenticated users can insert members\\" ON public.members\n    FOR INSERT WITH CHECK (auth.role() = 'authenticated')","CREATE POLICY \\"Authenticated users can update members\\" ON public.members\n    FOR UPDATE USING (auth.role() = 'authenticated')","CREATE POLICY \\"Authenticated users can delete members\\" ON public.members\n    FOR DELETE USING (auth.role() = 'authenticated')","-- RLS Policies for membership_types (public read)\nCREATE POLICY \\"Anyone can view membership types\\" ON public.membership_types\n    FOR SELECT USING (true)","-- RLS Policies for promotions (authenticated users can manage all)\nCREATE POLICY \\"Authenticated users can view all promotions\\" ON public.promotions\n    FOR SELECT USING (auth.role() = 'authenticated')","CREATE POLICY \\"Authenticated users can insert promotions\\" ON public.promotions\n    FOR INSERT WITH CHECK (auth.role() = 'authenticated')","CREATE POLICY \\"Authenticated users can update promotions\\" ON public.promotions\n    FOR UPDATE USING (auth.role() = 'authenticated')","CREATE POLICY \\"Authenticated users can delete promotions\\" ON public.promotions\n    FOR DELETE USING (auth.role() = 'authenticated')","-- RLS Policies for card_usage (authenticated users can manage all)\nCREATE POLICY \\"Authenticated users can view all card usage\\" ON public.card_usage\n    FOR SELECT USING (auth.role() = 'authenticated')","CREATE POLICY \\"Authenticated users can insert card usage\\" ON public.card_usage\n    FOR INSERT WITH CHECK (auth.role() = 'authenticated')","CREATE POLICY \\"Authenticated users can update card usage\\" ON public.card_usage\n    FOR UPDATE USING (auth.role() = 'authenticated')","CREATE POLICY \\"Authenticated users can delete card usage\\" ON public.card_usage\n    FOR DELETE USING (auth.role() = 'authenticated')","-- RLS Policies for applied_promotions (authenticated users can manage all)\nCREATE POLICY \\"Authenticated users can view all applied promotions\\" ON public.applied_promotions\n    FOR SELECT USING (auth.role() = 'authenticated')","CREATE POLICY \\"Authenticated users can insert applied promotions\\" ON public.applied_promotions\n    FOR INSERT WITH CHECK (auth.role() = 'authenticated')","CREATE POLICY \\"Authenticated users can update applied promotions\\" ON public.applied_promotions\n    FOR UPDATE USING (auth.role() = 'authenticated')","CREATE POLICY \\"Authenticated users can delete applied promotions\\" ON public.applied_promotions\n    FOR DELETE USING (auth.role() = 'authenticated')","-- RLS Policies for wallet_passes (authenticated users can manage all)\nCREATE POLICY \\"Authenticated users can view all wallet passes\\" ON public.wallet_passes\n    FOR SELECT USING (auth.role() = 'authenticated')","CREATE POLICY \\"Authenticated users can insert wallet passes\\" ON public.wallet_passes\n    FOR INSERT WITH CHECK (auth.role() = 'authenticated')","CREATE POLICY \\"Authenticated users can update wallet passes\\" ON public.wallet_passes\n    FOR UPDATE USING (auth.role() = 'authenticated')","CREATE POLICY \\"Authenticated users can delete wallet passes\\" ON public.wallet_passes\n    FOR DELETE USING (auth.role() = 'authenticated')","-- Insert some default membership types\nINSERT INTO public.membership_types (name, description, benefits, price, duration_months, color) VALUES\n    ('Basic', 'Membresía básica con beneficios estándar', '{\\"benefits\\": [\\"Acceso básico\\", \\"10% descuento\\", \\"Acumulación de puntos\\"]}', 0.00, 12, '#6B7280'),\n    ('Silver', 'Membresía Silver con beneficios mejorados', '{\\"benefits\\": [\\"Acceso prioritario\\", \\"15% descuento\\", \\"Doble puntos\\", \\"Promociones exclusivas\\"]}', 49.99, 12, '#C0C0C0'),\n    ('Gold', 'Membresía Gold premium', '{\\"benefits\\": [\\"Acceso VIP\\", \\"20% descuento\\", \\"Triple puntos\\", \\"Promociones exclusivas\\", \\"Eventos especiales\\"]}', 99.99, 12, '#FFD700'),\n    ('Platinum', 'Membresía Platinum de élite', '{\\"benefits\\": [\\"Acceso ilimitado\\", \\"30% descuento\\", \\"Cuádruple puntos\\", \\"Todas las promociones\\", \\"Eventos VIP\\", \\"Atención personalizada\\"]}', 199.99, 12, '#E5E4E2')"}	initial_schema
20250112	{"-- Migration: System Configuration\n-- Date: 2025-01-10\n-- Description: Create system_config table for configurable settings\n\n-- =============================================================================\n-- 1. CREATE SYSTEM_CONFIG TABLE\n-- =============================================================================\n\nCREATE TABLE IF NOT EXISTS system_config (\n    key TEXT PRIMARY KEY,\n    value JSONB NOT NULL,\n    description TEXT,\n    updated_at TIMESTAMPTZ DEFAULT NOW(),\n    updated_by UUID REFERENCES auth.users(id)\n)","-- =============================================================================\n-- 2. INSERT DEFAULT CONFIG\n-- =============================================================================\n\nINSERT INTO system_config (key, value, description) VALUES\n('points_rules', '{\n  \\"per_dollar_spent\\": 1,\n  \\"per_visit\\": 10,\n  \\"per_event_attended\\": 20\n}'::jsonb, 'Reglas de acumulación de puntos'),\n\n('tier_thresholds', '{\n  \\"Basic\\": {\\"min_spent\\": 0, \\"min_visits\\": 0},\n  \\"Silver\\": {\\"min_spent\\": 500, \\"min_visits\\": 20},\n  \\"Gold\\": {\\"min_spent\\": 2000, \\"min_visits\\": 50},\n  \\"Platinum\\": {\\"min_spent\\": 5000, \\"min_visits\\": 100}\n}'::jsonb, 'Umbrales para cambio de tier automático')\nON CONFLICT (key) DO NOTHING","-- =============================================================================\n-- 3. TRIGGERS\n-- =============================================================================\n\nCREATE TRIGGER update_system_config_updated_at \nBEFORE UPDATE ON system_config\nFOR EACH ROW EXECUTE FUNCTION update_updated_at_column()","-- =============================================================================\n-- 4. ROW LEVEL SECURITY\n-- =============================================================================\n\nALTER TABLE system_config ENABLE ROW LEVEL SECURITY","-- Everyone can read config\nCREATE POLICY \\"Anyone can view system config\\" ON system_config\nFOR SELECT USING (true)","-- Only authenticated users can update config\nCREATE POLICY \\"Authenticated users can update config\\" ON system_config\nFOR UPDATE USING (auth.role() = 'authenticated')","-- =============================================================================\n-- DONE!\n-- ============================================================================="}	system_config
20250113	{"-- =============================================================================\n-- Migration: Add GoHighLevel Webhook Configuration\n-- Description: Add webhook URL to system config for GHL integration\n-- Date: 2025-01-10\n-- =============================================================================\n\n-- Insert default GHL webhook config if it doesn't exist\nINSERT INTO system_config (key, value, description)\nVALUES (\n  'ghl_webhook_url',\n  '\\"\\"'::json,\n  'GoHighLevel webhook URL para enviar tarjetas digitales a clientes'\n)\nON CONFLICT (key) DO NOTHING","-- Add comment\nCOMMENT ON TABLE system_config IS 'System-wide configuration including integrations like GoHighLevel'"}	add_ghl_webhook_config
20250114	{"-- =============================================================================\n-- Migration: Transaction Deduplication\n-- Description: Add transaction_id for preventing duplicate submissions\n-- Date: 2025-01-10\n-- =============================================================================\n\n-- 1. Add transaction_id column to card_usage\nALTER TABLE card_usage \nADD COLUMN IF NOT EXISTS transaction_id TEXT","-- 2. Create unique index to prevent duplicates\nCREATE UNIQUE INDEX IF NOT EXISTS idx_card_usage_transaction_id \nON card_usage(transaction_id) \nWHERE transaction_id IS NOT NULL","-- 3. Add index for faster lookups\nCREATE INDEX IF NOT EXISTS idx_card_usage_transaction_id_lookup \nON card_usage(transaction_id)","-- 4. Add comment\nCOMMENT ON COLUMN card_usage.transaction_id IS 'Unique transaction ID generated by frontend to prevent duplicate submissions'"}	transaction_deduplication
20250115	{"-- =============================================================================\n-- APPLE WALLET PUSH TOKENS\n-- =============================================================================\n\n-- Table to store Apple Wallet device push tokens\nCREATE TABLE IF NOT EXISTS wallet_push_tokens (\n    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n    pass_id UUID NOT NULL REFERENCES wallet_passes(id) ON DELETE CASCADE,\n    member_id UUID REFERENCES members(id) ON DELETE CASCADE,\n    device_library_identifier TEXT NOT NULL,\n    push_token TEXT NOT NULL UNIQUE,\n    is_active BOOLEAN DEFAULT true,\n    last_updated_at TIMESTAMPTZ,\n    created_at TIMESTAMPTZ DEFAULT NOW(),\n    updated_at TIMESTAMPTZ DEFAULT NOW(),\n    \n    UNIQUE(device_library_identifier, pass_id)\n)","-- Table to track wallet push notifications sent\nCREATE TABLE IF NOT EXISTS wallet_push_notifications (\n    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n    title TEXT,\n    message TEXT NOT NULL,\n    \n    -- Targeting\n    target_type TEXT CHECK (target_type IN ('all', 'segment', 'individual', 'tier')),\n    target_filter JSONB,\n    \n    -- Stats\n    total_sent INTEGER DEFAULT 0,\n    total_delivered INTEGER DEFAULT 0,\n    total_failed INTEGER DEFAULT 0,\n    \n    -- Metadata\n    sent_by UUID REFERENCES auth.users(id),\n    sent_at TIMESTAMPTZ DEFAULT NOW(),\n    created_at TIMESTAMPTZ DEFAULT NOW()\n)","-- Indexes\nCREATE INDEX IF NOT EXISTS idx_wallet_push_tokens_member ON wallet_push_tokens(member_id)","CREATE INDEX IF NOT EXISTS idx_wallet_push_tokens_active ON wallet_push_tokens(is_active) WHERE is_active = true","CREATE INDEX IF NOT EXISTS idx_wallet_push_tokens_device ON wallet_push_tokens(device_library_identifier)","CREATE INDEX IF NOT EXISTS idx_wallet_push_notifications_sent_at ON wallet_push_notifications(sent_at DESC)","-- Triggers\nCREATE TRIGGER update_wallet_push_tokens_updated_at \nBEFORE UPDATE ON wallet_push_tokens\nFOR EACH ROW EXECUTE FUNCTION update_updated_at_column()","-- RLS Policies\nALTER TABLE wallet_push_tokens ENABLE ROW LEVEL SECURITY","ALTER TABLE wallet_push_notifications ENABLE ROW LEVEL SECURITY","CREATE POLICY \\"Authenticated users can view wallet tokens\\" ON wallet_push_tokens\nFOR SELECT USING (auth.role() = 'authenticated')","CREATE POLICY \\"Authenticated users can manage wallet tokens\\" ON wallet_push_tokens\nFOR ALL USING (auth.role() = 'authenticated')","CREATE POLICY \\"Authenticated users can view wallet notifications\\" ON wallet_push_notifications\nFOR SELECT USING (auth.role() = 'authenticated')","CREATE POLICY \\"Authenticated users can create wallet notifications\\" ON wallet_push_notifications\nFOR INSERT WITH CHECK (auth.role() = 'authenticated')","-- Grant permissions\nGRANT ALL ON wallet_push_tokens TO authenticated","GRANT ALL ON wallet_push_notifications TO authenticated"}	wallet_push_tokens
20250116	{"-- =============================================================================\n-- Migration: Add Wallet Status to Member Stats View\n-- Description: Update member_stats view to include wallet installation status\n-- Date: 2025-01-10\n-- =============================================================================\n\n-- Drop existing view\nDROP VIEW IF EXISTS member_stats","-- Recreate view with wallet status (simplified for initial schema)\nCREATE VIEW member_stats AS\nSELECT \n    m.id,\n    m.full_name,\n    m.email,\n    m.phone,\n    m.membership_type,\n    m.status,\n    m.member_number,\n    m.points,\n    m.joined_date,\n    m.created_at,\n    m.updated_at,\n    -- Usage stats (simplified - no event_type or amount_spent in initial schema)\n    COALESCE(COUNT(cu.id), 0) as total_visits,\n    0 as total_purchases,\n    0 as total_events,\n    0::numeric as lifetime_spent,\n    COALESCE(COUNT(cu.id) FILTER (WHERE cu.usage_date >= NOW() - INTERVAL '30 days'), 0) as visits_last_30_days,\n    0::numeric as spent_last_30_days,\n    COALESCE(COUNT(cu.id) FILTER (WHERE cu.usage_date >= NOW() - INTERVAL '90 days'), 0) as visits_last_90_days,\n    0::numeric as spent_last_90_days,\n    MAX(cu.usage_date) as last_visit,\n    0::numeric as average_purchase,\n    COUNT(DISTINCT ap.promotion_id) as promotions_used,\n    -- Wallet status\n    COUNT(wp.id) > 0 as has_wallet,\n    ARRAY_AGG(\n        CASE \n            WHEN wp.id IS NOT NULL \n            THEN wp.pass_type \n            ELSE NULL \n        END\n    ) FILTER (WHERE wp.id IS NOT NULL) as wallet_types\nFROM members m\nLEFT JOIN card_usage cu ON m.id = cu.member_id\nLEFT JOIN applied_promotions ap ON m.id = ap.member_id\nLEFT JOIN wallet_passes wp ON m.id = wp.member_id\nGROUP BY m.id","-- Grant permissions\nGRANT SELECT ON member_stats TO authenticated","-- Add comment\nCOMMENT ON VIEW member_stats IS 'Aggregated member statistics including wallet installation status'"}	wallet_status_in_member_stats
20250117	{"-- Migration: Improve member registration fields\n-- Description: Add separate phone fields and birthday fields\n-- Date: 2024-11-04\n\n-- ============================================\n-- 1. Add phone fields (separated by country code and number)\n-- ============================================\n\n-- Add country code column (default +1 for US/Miami)\nALTER TABLE members\nADD COLUMN IF NOT EXISTS phone_country_code VARCHAR(5) DEFAULT '+1'","-- Add phone number column (10 digits)\nALTER TABLE members\nADD COLUMN IF NOT EXISTS phone_number VARCHAR(15)","-- Migrate existing phone data to new structure\n-- Assumes existing phone is in format like \\"+1234567890\\" or \\"1234567890\\"\nUPDATE members \nSET \n  phone_country_code = CASE \n    WHEN phone LIKE '+%' THEN SUBSTRING(phone FROM 1 FOR POSITION(' ' IN phone || ' ') - 1)\n    ELSE '+1'\n  END,\n  phone_number = CASE \n    WHEN phone LIKE '+%' THEN REGEXP_REPLACE(SUBSTRING(phone FROM POSITION(' ' IN phone || ' ')), '[^0-9]', '', 'g')\n    ELSE REGEXP_REPLACE(phone, '[^0-9]', '', 'g')\n  END\nWHERE phone IS NOT NULL AND phone != ''","-- ============================================\n-- 2. Add birthday fields (day, month, year)\n-- ============================================\n\n-- Add birthday component fields\nALTER TABLE members\nADD COLUMN IF NOT EXISTS birth_day INTEGER CHECK (birth_day BETWEEN 1 AND 31)","ALTER TABLE members\nADD COLUMN IF NOT EXISTS birth_month INTEGER CHECK (birth_month BETWEEN 1 AND 12)","ALTER TABLE members\nADD COLUMN IF NOT EXISTS birth_year INTEGER CHECK (\n  birth_year >= 1900 AND \n  birth_year <= EXTRACT(YEAR FROM CURRENT_DATE)\n)","-- Add generated column for complete date of birth\nALTER TABLE members\nADD COLUMN IF NOT EXISTS date_of_birth DATE GENERATED ALWAYS AS (\n  CASE \n    WHEN birth_day IS NOT NULL AND birth_month IS NOT NULL AND birth_year IS NOT NULL\n    THEN make_date(birth_year, birth_month, birth_day)\n    ELSE NULL\n  END\n) STORED","-- ============================================\n-- 3. Create indexes for better performance\n-- ============================================\n\n-- Index for phone lookup\nCREATE INDEX IF NOT EXISTS idx_members_phone_lookup \nON members(phone_country_code, phone_number)","-- Index for birthday month/day (for birthday campaigns)\nCREATE INDEX IF NOT EXISTS idx_members_birthday_month_day \nON members(birth_month, birth_day)","-- Index for complete date of birth\nCREATE INDEX IF NOT EXISTS idx_members_date_of_birth \nON members(date_of_birth)","-- ============================================\n-- 4. Add comments for documentation\n-- ============================================\n\nCOMMENT ON COLUMN members.phone_country_code IS 'Country code for phone number (e.g., +1, +52, +54)'","COMMENT ON COLUMN members.phone_number IS 'Phone number without country code (up to 15 digits)'","COMMENT ON COLUMN members.birth_day IS 'Day of birth (1-31)'","COMMENT ON COLUMN members.birth_month IS 'Month of birth (1-12)'","COMMENT ON COLUMN members.birth_year IS 'Year of birth (1900-current year)'","COMMENT ON COLUMN members.date_of_birth IS 'Complete date of birth (auto-generated from day/month/year)'","-- ============================================\n-- 5. Create function to get upcoming birthdays\n-- ============================================\n\nCREATE OR REPLACE FUNCTION get_upcoming_birthdays(days_ahead INTEGER DEFAULT 7)\nRETURNS TABLE (\n  member_id UUID,\n  full_name TEXT,\n  email TEXT,\n  phone_country_code VARCHAR(5),\n  phone_number VARCHAR(15),\n  birth_month INTEGER,\n  birth_day INTEGER,\n  days_until_birthday INTEGER\n) AS $$\nBEGIN\n  RETURN QUERY\n  SELECT \n    m.id,\n    m.full_name,\n    m.email,\n    m.phone_country_code,\n    m.phone_number,\n    m.birth_month,\n    m.birth_day,\n    CASE\n      WHEN make_date(\n        EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,\n        m.birth_month,\n        m.birth_day\n      ) >= CURRENT_DATE\n      THEN make_date(\n        EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,\n        m.birth_month,\n        m.birth_day\n      ) - CURRENT_DATE\n      ELSE make_date(\n        EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER + 1,\n        m.birth_month,\n        m.birth_day\n      ) - CURRENT_DATE\n    END AS days_until_birthday\n  FROM members m\n  WHERE \n    m.birth_month IS NOT NULL AND \n    m.birth_day IS NOT NULL AND\n    m.status = 'active'\n  HAVING days_until_birthday <= days_ahead\n  ORDER BY days_until_birthday ASC;\nEND;\n$$ LANGUAGE plpgsql","-- ============================================\n-- 6. Create function to validate phone number\n-- ============================================\n\nCREATE OR REPLACE FUNCTION validate_phone_number(\n  country_code VARCHAR(5),\n  phone_num VARCHAR(15)\n)\nRETURNS BOOLEAN AS $$\nBEGIN\n  -- Remove all non-digit characters\n  phone_num := REGEXP_REPLACE(phone_num, '[^0-9]', '', 'g');\n  \n  -- Basic validation\n  IF phone_num IS NULL OR LENGTH(phone_num) < 10 THEN\n    RETURN FALSE;\n  END IF;\n  \n  -- Country-specific validation\n  CASE country_code\n    WHEN '+1' THEN -- US/Canada (10 digits)\n      RETURN LENGTH(phone_num) = 10;\n    WHEN '+52' THEN -- Mexico (10 digits)\n      RETURN LENGTH(phone_num) = 10;\n    WHEN '+54' THEN -- Argentina (10-13 digits)\n      RETURN LENGTH(phone_num) BETWEEN 10 AND 13;\n    ELSE\n      RETURN LENGTH(phone_num) BETWEEN 10 AND 15;\n  END CASE;\nEND;\n$$ LANGUAGE plpgsql","-- ============================================\n-- 7. Migration complete notification\n-- ============================================\n\nDO $$\nBEGIN\n  RAISE NOTICE 'Migration 20241104_improve_member_registration completed successfully';\n  RAISE NOTICE 'Added columns: phone_country_code, phone_number, birth_day, birth_month, birth_year, date_of_birth';\n  RAISE NOTICE 'Created indexes for phone lookup and birthday searches';\n  RAISE NOTICE 'Created helper functions: get_upcoming_birthdays, validate_phone_number';\nEND $$"}	improve_member_registration
20250118	{"-- Migration: Onboarding Questions System\n-- Description: Create dynamic onboarding questions system\n-- Date: 2024-11-04\n\n-- ============================================\n-- 1. Create onboarding_questions table\n-- ============================================\n\nCREATE TABLE IF NOT EXISTS onboarding_questions (\n  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\n  question_text TEXT NOT NULL,\n  question_type TEXT NOT NULL CHECK (\n    question_type IN ('text', 'select', 'multi_select', 'yes_no', 'rating')\n  ),\n  options JSONB, -- Array of options for select/multi_select types\n  placeholder TEXT, -- Placeholder text for text inputs\n  is_required BOOLEAN DEFAULT false,\n  display_order INTEGER NOT NULL,\n  is_active BOOLEAN DEFAULT true,\n  help_text TEXT, -- Optional help text to show below the question\n  created_at TIMESTAMPTZ DEFAULT NOW(),\n  updated_at TIMESTAMPTZ DEFAULT NOW()\n)","-- ============================================\n-- 2. Create member_onboarding_responses table\n-- ============================================\n\nCREATE TABLE IF NOT EXISTS member_onboarding_responses (\n  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\n  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,\n  question_id UUID NOT NULL REFERENCES onboarding_questions(id) ON DELETE CASCADE,\n  response_value TEXT NOT NULL, -- Store as text, parse based on question_type\n  created_at TIMESTAMPTZ DEFAULT NOW(),\n  updated_at TIMESTAMPTZ DEFAULT NOW(),\n  UNIQUE(member_id, question_id) -- One response per member per question\n)","-- ============================================\n-- 3. Create indexes for performance\n-- ============================================\n\nCREATE INDEX IF NOT EXISTS idx_onboarding_questions_order \nON onboarding_questions(display_order) \nWHERE is_active = true","CREATE INDEX IF NOT EXISTS idx_onboarding_questions_active \nON onboarding_questions(is_active)","CREATE INDEX IF NOT EXISTS idx_member_responses_member \nON member_onboarding_responses(member_id)","CREATE INDEX IF NOT EXISTS idx_member_responses_question \nON member_onboarding_responses(question_id)","-- ============================================\n-- 4. Add trigger for updated_at\n-- ============================================\n\nCREATE TRIGGER update_onboarding_questions_updated_at \nBEFORE UPDATE ON onboarding_questions\nFOR EACH ROW \nEXECUTE FUNCTION update_updated_at_column()","CREATE TRIGGER update_member_responses_updated_at \nBEFORE UPDATE ON member_onboarding_responses\nFOR EACH ROW \nEXECUTE FUNCTION update_updated_at_column()","-- ============================================\n-- 5. Enable Row Level Security\n-- ============================================\n\nALTER TABLE onboarding_questions ENABLE ROW LEVEL SECURITY","ALTER TABLE member_onboarding_responses ENABLE ROW LEVEL SECURITY","-- ============================================\n-- 6. RLS Policies for onboarding_questions\n-- ============================================\n\n-- Anyone can view active questions (for member app)\nCREATE POLICY \\"Anyone can view active onboarding questions\\" \nON onboarding_questions\nFOR SELECT \nUSING (is_active = true)","-- Authenticated users can manage all questions (admin dashboard)\nCREATE POLICY \\"Authenticated users can view all questions\\" \nON onboarding_questions\nFOR SELECT \nUSING (auth.role() = 'authenticated')","CREATE POLICY \\"Authenticated users can insert questions\\" \nON onboarding_questions\nFOR INSERT \nWITH CHECK (auth.role() = 'authenticated')","CREATE POLICY \\"Authenticated users can update questions\\" \nON onboarding_questions\nFOR UPDATE \nUSING (auth.role() = 'authenticated')","CREATE POLICY \\"Authenticated users can delete questions\\" \nON onboarding_questions\nFOR DELETE \nUSING (auth.role() = 'authenticated')","-- ============================================\n-- 7. RLS Policies for member_onboarding_responses\n-- ============================================\n\n-- Members can insert their own responses\nCREATE POLICY \\"Members can insert their responses\\" \nON member_onboarding_responses\nFOR INSERT \nWITH CHECK (true)","-- Will validate member_id in application layer\n\n-- Members can view their own responses\nCREATE POLICY \\"Members can view their own responses\\" \nON member_onboarding_responses\nFOR SELECT \nUSING (true)","-- Will filter by member_id in application layer\n\n-- Authenticated users can view all responses (admin dashboard)\nCREATE POLICY \\"Authenticated users can view all responses\\" \nON member_onboarding_responses\nFOR SELECT \nUSING (auth.role() = 'authenticated')","-- Authenticated users can update responses (if needed)\nCREATE POLICY \\"Authenticated users can update responses\\" \nON member_onboarding_responses\nFOR UPDATE \nUSING (auth.role() = 'authenticated')","-- ============================================\n-- 8. Insert default onboarding questions (in English)\n-- ============================================\n\nINSERT INTO onboarding_questions (\n  question_text,\n  question_type,\n  options,\n  is_required,\n  display_order,\n  is_active\n) VALUES\n(\n  'What''s your favorite drink?',\n  'select',\n  '[\\"Coffee\\", \\"Tea\\", \\"Juice\\", \\"Smoothie\\", \\"Other\\"]'::jsonb,\n  true,\n  1,\n  true\n),\n(\n  'What do you like to do?',\n  'multi_select',\n  '[\\"Work\\", \\"Study\\", \\"Read\\", \\"Meet friends\\", \\"Relax\\"]'::jsonb,\n  true,\n  2,\n  true\n),\n(\n  'Do you have any dietary restrictions?',\n  'yes_no',\n  '[\\"Yes\\", \\"No\\"]'::jsonb,\n  false,\n  3,\n  true\n),\n(\n  'How would you rate your coffee knowledge?',\n  'rating',\n  NULL, -- Rating uses 1-5 stars, no options needed\n  false,\n  4,\n  true\n)","-- ============================================\n-- 9. Create view for onboarding analytics\n-- ============================================\n\nCREATE OR REPLACE VIEW onboarding_response_stats AS\nSELECT \n  oq.id AS question_id,\n  oq.question_text,\n  oq.question_type,\n  oq.display_order,\n  COUNT(DISTINCT mor.member_id) AS total_responses,\n  COUNT(mor.id) AS response_count,\n  CASE \n    WHEN oq.question_type IN ('select', 'multi_select', 'yes_no') \n    THEN (\n      SELECT jsonb_agg(\n        jsonb_build_object(\n          'value', response_value,\n          'count', response_count\n        ) ORDER BY response_count DESC\n      )\n      FROM (\n        SELECT \n          mor2.response_value,\n          COUNT(*) AS response_count\n        FROM member_onboarding_responses mor2\n        WHERE mor2.question_id = oq.id\n        GROUP BY mor2.response_value\n      ) AS value_counts\n    )\n    ELSE NULL\n  END AS response_distribution\nFROM onboarding_questions oq\nLEFT JOIN member_onboarding_responses mor ON oq.id = mor.question_id\nWHERE oq.is_active = true\nGROUP BY oq.id, oq.question_text, oq.question_type, oq.display_order\nORDER BY oq.display_order","-- ============================================\n-- 10. Create function to get member's completion status\n-- ============================================\n\nCREATE OR REPLACE FUNCTION get_member_onboarding_status(member_uuid UUID)\nRETURNS TABLE (\n  total_questions INTEGER,\n  answered_questions INTEGER,\n  required_questions INTEGER,\n  required_answered INTEGER,\n  is_complete BOOLEAN,\n  completion_percentage NUMERIC\n) AS $$\nBEGIN\n  RETURN QUERY\n  SELECT \n    COUNT(*)::INTEGER AS total_questions,\n    COUNT(mor.id)::INTEGER AS answered_questions,\n    COUNT(*) FILTER (WHERE oq.is_required = true)::INTEGER AS required_questions,\n    COUNT(mor.id) FILTER (WHERE oq.is_required = true)::INTEGER AS required_answered,\n    (COUNT(mor.id) FILTER (WHERE oq.is_required = true) >= COUNT(*) FILTER (WHERE oq.is_required = true)) AS is_complete,\n    CASE \n      WHEN COUNT(*) = 0 THEN 0\n      ELSE ROUND((COUNT(mor.id)::NUMERIC / COUNT(*)::NUMERIC) * 100, 2)\n    END AS completion_percentage\n  FROM onboarding_questions oq\n  LEFT JOIN member_onboarding_responses mor \n    ON oq.id = mor.question_id AND mor.member_id = member_uuid\n  WHERE oq.is_active = true;\nEND;\n$$ LANGUAGE plpgsql","-- ============================================\n-- 11. Create function to reorder questions\n-- ============================================\n\nCREATE OR REPLACE FUNCTION reorder_onboarding_question(\n  question_uuid UUID,\n  new_order INTEGER\n)\nRETURNS VOID AS $$\nDECLARE\n  old_order INTEGER;\nBEGIN\n  -- Get current order\n  SELECT display_order INTO old_order\n  FROM onboarding_questions\n  WHERE id = question_uuid;\n\n  IF old_order IS NULL THEN\n    RAISE EXCEPTION 'Question not found';\n  END IF;\n\n  -- If moving down (increasing order number)\n  IF new_order > old_order THEN\n    UPDATE onboarding_questions\n    SET display_order = display_order - 1\n    WHERE display_order > old_order \n      AND display_order <= new_order\n      AND id != question_uuid;\n  -- If moving up (decreasing order number)\n  ELSIF new_order < old_order THEN\n    UPDATE onboarding_questions\n    SET display_order = display_order + 1\n    WHERE display_order >= new_order \n      AND display_order < old_order\n      AND id != question_uuid;\n  END IF;\n\n  -- Update the question's order\n  UPDATE onboarding_questions\n  SET display_order = new_order\n  WHERE id = question_uuid;\nEND;\n$$ LANGUAGE plpgsql","-- ============================================\n-- 12. Add comments for documentation\n-- ============================================\n\nCOMMENT ON TABLE onboarding_questions IS 'Configurable onboarding questions for new members'","COMMENT ON TABLE member_onboarding_responses IS 'Member responses to onboarding questions'","COMMENT ON COLUMN onboarding_questions.question_type IS 'Type: text, select, multi_select, yes_no, rating'","COMMENT ON COLUMN onboarding_questions.options IS 'JSON array of options for select/multi_select types'","COMMENT ON COLUMN onboarding_questions.display_order IS 'Order in which questions are displayed (lower = first)'","COMMENT ON COLUMN member_onboarding_responses.response_value IS 'Response stored as text. For multi_select, comma-separated values'","-- ============================================\n-- 13. Migration complete notification\n-- ============================================\n\nDO $$\nBEGIN\n  RAISE NOTICE 'Migration 20241104_onboarding_questions_system completed successfully';\n  RAISE NOTICE 'Created tables: onboarding_questions, member_onboarding_responses';\n  RAISE NOTICE 'Created view: onboarding_response_stats';\n  RAISE NOTICE 'Created functions: get_member_onboarding_status, reorder_onboarding_question';\n  RAISE NOTICE 'Inserted 4 default questions in English';\nEND $$"}	onboarding_questions_system
20250119	{"-- Add GHL contact ID column to members table\nALTER TABLE members \nADD COLUMN IF NOT EXISTS ghl_contact_id TEXT","-- Create index for faster lookups\nCREATE INDEX IF NOT EXISTS idx_members_ghl_contact_id ON members(ghl_contact_id)","-- Add comment\nCOMMENT ON COLUMN members.ghl_contact_id IS 'GoHighLevel contact ID for this member'"}	02_add_ghl_contact_id
20250120	{"-- Migration: Branches System\n-- Date: 2025-01-10\n-- Description: Add branches table and migrate branch_location to branch_id\n\n-- =============================================================================\n-- 1. CREATE BRANCHES TABLE\n-- =============================================================================\n\nCREATE TABLE IF NOT EXISTS branches (\n    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\n    name TEXT NOT NULL UNIQUE,\n    address TEXT,\n    city TEXT,\n    phone TEXT,\n    email TEXT,\n    manager_name TEXT,\n    is_active BOOLEAN DEFAULT true,\n    opening_hours JSONB DEFAULT '{}'::jsonb,\n    created_at TIMESTAMPTZ DEFAULT NOW(),\n    updated_at TIMESTAMPTZ DEFAULT NOW()\n)","-- =============================================================================\n-- 2. MIGRATE EXISTING DATA (COMMENTED OUT FOR FRESH INSTALL)\n-- =============================================================================\n\n-- Insert unique branch locations from card_usage\n-- INSERT INTO branches (name, is_active)\n-- SELECT DISTINCT branch_location, true\n-- FROM card_usage \n-- WHERE branch_location IS NOT NULL \n-- AND branch_location != ''\n-- ON CONFLICT (name) DO NOTHING;\n\n-- =============================================================================\n-- 3. ADD BRANCH_ID TO CARD_USAGE\n-- =============================================================================\n\nALTER TABLE card_usage \nADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id)","-- Migrate existing branch_location data to branch_id\n-- UPDATE card_usage cu\n-- SET branch_id = b.id\n-- FROM branches b\n-- WHERE cu.branch_location = b.name\n-- AND cu.branch_id IS NULL;\n\n-- =============================================================================\n-- 4. CREATE INDEXES\n-- =============================================================================\n\nCREATE INDEX IF NOT EXISTS idx_branches_name ON branches(name)","CREATE INDEX IF NOT EXISTS idx_branches_is_active ON branches(is_active)","CREATE INDEX IF NOT EXISTS idx_card_usage_branch_id ON card_usage(branch_id)","-- =============================================================================\n-- 5. TRIGGERS\n-- =============================================================================\n\nCREATE TRIGGER update_branches_updated_at \nBEFORE UPDATE ON branches\nFOR EACH ROW EXECUTE FUNCTION update_updated_at_column()","-- =============================================================================\n-- 6. ROW LEVEL SECURITY\n-- =============================================================================\n\nALTER TABLE branches ENABLE ROW LEVEL SECURITY","CREATE POLICY \\"Authenticated users can view branches\\" ON branches\nFOR SELECT USING (auth.role() = 'authenticated')","CREATE POLICY \\"Authenticated users can create branches\\" ON branches\nFOR INSERT WITH CHECK (auth.role() = 'authenticated')","CREATE POLICY \\"Authenticated users can update branches\\" ON branches\nFOR UPDATE USING (auth.role() = 'authenticated')","CREATE POLICY \\"Authenticated users can delete branches\\" ON branches\nFOR DELETE USING (auth.role() = 'authenticated')","-- =============================================================================\n-- 7. VIEW FOR BRANCH STATS\n-- =============================================================================\n\nCREATE OR REPLACE VIEW branch_stats AS\nSELECT \n    b.id,\n    b.name,\n    b.address,\n    b.city,\n    b.is_active,\n    COUNT(DISTINCT cu.member_id) as unique_customers,\n    COUNT(cu.id) as total_transactions,\n    0 as total_purchases,\n    0 as total_visits,\n    0 as total_events,\n    0::numeric as total_revenue,\n    0::numeric as average_purchase,\n    COUNT(CASE WHEN cu.usage_date >= NOW() - INTERVAL '30 days' THEN 1 END) as transactions_last_30_days,\n    0::numeric as revenue_last_30_days,\n    MAX(cu.usage_date) as last_transaction_date\nFROM branches b\nLEFT JOIN card_usage cu ON b.id = cu.branch_id\nGROUP BY b.id, b.name, b.address, b.city, b.is_active","-- Grant permissions\nGRANT SELECT ON branch_stats TO authenticated","-- =============================================================================\n-- DONE!\n-- ============================================================================="}	03_branches_system
20250121	{"-- Create card_design_config table for customizing wallet card appearance\nCREATE TABLE IF NOT EXISTS public.card_design_config (\n    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\n    name TEXT NOT NULL UNIQUE,\n    description TEXT,\n    is_default BOOLEAN DEFAULT false,\n    \n    -- General styling\n    logo_text TEXT DEFAULT 'Negroni',\n    organization_name TEXT DEFAULT 'Negroni Membership',\n    \n    -- Colors (RGB format)\n    colors JSONB DEFAULT '{\n        \\"basic\\": {\\"bg\\": \\"rgb(107, 114, 128)\\", \\"fg\\": \\"rgb(255, 255, 255)\\", \\"label\\": \\"rgb(255, 255, 255)\\"},\n        \\"silver\\": {\\"bg\\": \\"rgb(192, 192, 192)\\", \\"fg\\": \\"rgb(0, 0, 0)\\", \\"label\\": \\"rgb(0, 0, 0)\\"},\n        \\"gold\\": {\\"bg\\": \\"rgb(255, 215, 0)\\", \\"fg\\": \\"rgb(0, 0, 0)\\", \\"label\\": \\"rgb(0, 0, 0)\\"},\n        \\"platinum\\": {\\"bg\\": \\"rgb(229, 228, 226)\\", \\"fg\\": \\"rgb(0, 0, 0)\\", \\"label\\": \\"rgb(0, 0, 0)\\"}\n    }'::jsonb,\n    \n    -- Fields configuration (what to show in each section)\n    header_fields JSONB DEFAULT '[\n        {\\"key\\": \\"membership_type\\", \\"label\\": \\"TIPO\\", \\"source\\": \\"membership_type\\", \\"transform\\": \\"uppercase\\"}\n    ]'::jsonb,\n    \n    primary_fields JSONB DEFAULT '[\n        {\\"key\\": \\"member_name\\", \\"label\\": \\"MIEMBRO\\", \\"source\\": \\"full_name\\"}\n    ]'::jsonb,\n    \n    secondary_fields JSONB DEFAULT '[\n        {\\"key\\": \\"member_number\\", \\"label\\": \\"NÚMERO\\", \\"source\\": \\"member_number\\"},\n        {\\"key\\": \\"points\\", \\"label\\": \\"PUNTOS\\", \\"source\\": \\"points\\", \\"changeMessage\\": \\"Tus puntos han cambiado a %@\\"}\n    ]'::jsonb,\n    \n    auxiliary_fields JSONB DEFAULT '[\n        {\\"key\\": \\"expiry_date\\", \\"label\\": \\"VENCE\\", \\"source\\": \\"expiry_date\\", \\"dateStyle\\": \\"PKDateStyleMedium\\"}\n    ]'::jsonb,\n    \n    back_fields JSONB DEFAULT '[\n        {\\"key\\": \\"email\\", \\"label\\": \\"Email\\", \\"source\\": \\"email\\"},\n        {\\"key\\": \\"phone\\", \\"label\\": \\"Teléfono\\", \\"source\\": \\"phone\\", \\"optional\\": true},\n        {\\"key\\": \\"joined_date\\", \\"label\\": \\"Miembro desde\\", \\"source\\": \\"joined_date\\", \\"dateStyle\\": \\"PKDateStyleMedium\\"},\n        {\\"key\\": \\"terms\\", \\"label\\": \\"Términos y Condiciones\\", \\"value\\": \\"Esta tarjeta es personal e intransferible. Válida solo para el titular. Para más información visita nuestro sitio web.\\"}\n    ]'::jsonb,\n    \n    -- Barcode configuration\n    barcode_config JSONB DEFAULT '{\n        \\"format\\": \\"PKBarcodeFormatQR\\",\n        \\"messageEncoding\\": \\"iso-8859-1\\",\n        \\"messageSource\\": \\"member_number\\"\n    }'::jsonb,\n    \n    -- Images (URLs or base64)\n    logo_image TEXT,\n    icon_image TEXT,\n    background_image TEXT,\n    strip_image TEXT,\n    \n    -- Advanced styling\n    text_alignment TEXT DEFAULT 'left',\n    grouping_identifier TEXT,\n    suppress_strip_shine BOOLEAN DEFAULT false,\n    \n    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),\n    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()\n)","-- Create index\nCREATE INDEX idx_card_design_config_default ON public.card_design_config(is_default) WHERE is_default = true","-- Create trigger for updated_at\nCREATE TRIGGER update_card_design_config_updated_at BEFORE UPDATE ON public.card_design_config\n    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()","-- Enable RLS\nALTER TABLE public.card_design_config ENABLE ROW LEVEL SECURITY","-- RLS Policies\nCREATE POLICY \\"Authenticated users can view all card designs\\" ON public.card_design_config\n    FOR SELECT USING (auth.role() = 'authenticated')","CREATE POLICY \\"Authenticated users can insert card designs\\" ON public.card_design_config\n    FOR INSERT WITH CHECK (auth.role() = 'authenticated')","CREATE POLICY \\"Authenticated users can update card designs\\" ON public.card_design_config\n    FOR UPDATE USING (auth.role() = 'authenticated')","CREATE POLICY \\"Authenticated users can delete card designs\\" ON public.card_design_config\n    FOR DELETE USING (auth.role() = 'authenticated')","-- Insert default design configuration\nINSERT INTO public.card_design_config (name, description, is_default) VALUES\n    ('Diseño Predeterminado', 'Configuración de diseño predeterminada para las tarjetas de membresía', true)"}	04_card_design_config
20250122	{"-- Migration: Events and Invitations System\n-- Date: 2025-01-10\n-- Description: Create events and event attendees tracking\n\n-- =============================================================================\n-- 1. CREATE EVENTS TABLE\n-- =============================================================================\n\nCREATE TABLE IF NOT EXISTS events (\n    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\n    name TEXT NOT NULL,\n    description TEXT,\n    event_date TIMESTAMPTZ NOT NULL,\n    end_date TIMESTAMPTZ,\n    location TEXT,\n    branch_id UUID REFERENCES branches(id),\n    max_attendees INTEGER,\n    points_reward INTEGER DEFAULT 20,\n    status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),\n    image_url TEXT,\n    created_by UUID REFERENCES auth.users(id),\n    created_at TIMESTAMPTZ DEFAULT NOW(),\n    updated_at TIMESTAMPTZ DEFAULT NOW()\n)","-- =============================================================================\n-- 2. CREATE EVENT ATTENDEES TABLE\n-- =============================================================================\n\nCREATE TABLE IF NOT EXISTS event_attendees (\n    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),\n    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,\n    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,\n    status TEXT DEFAULT 'invited' CHECK (status IN ('invited', 'confirmed', 'attended', 'cancelled')),\n    invited_at TIMESTAMPTZ DEFAULT NOW(),\n    attended_at TIMESTAMPTZ,\n    notes TEXT,\n    UNIQUE(event_id, member_id)\n)","-- =============================================================================\n-- 3. CREATE INDEXES\n-- =============================================================================\n\nCREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date)","CREATE INDEX IF NOT EXISTS idx_events_status ON events(status)","CREATE INDEX IF NOT EXISTS idx_events_branch ON events(branch_id)","CREATE INDEX IF NOT EXISTS idx_event_attendees_event ON event_attendees(event_id)","CREATE INDEX IF NOT EXISTS idx_event_attendees_member ON event_attendees(member_id)","CREATE INDEX IF NOT EXISTS idx_event_attendees_status ON event_attendees(status)","-- =============================================================================\n-- 4. TRIGGERS\n-- =============================================================================\n\nCREATE TRIGGER update_events_updated_at \nBEFORE UPDATE ON events\nFOR EACH ROW EXECUTE FUNCTION update_updated_at_column()","-- =============================================================================\n-- 5. ROW LEVEL SECURITY\n-- =============================================================================\n\nALTER TABLE events ENABLE ROW LEVEL SECURITY","ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY","CREATE POLICY \\"Authenticated users can view events\\" ON events\nFOR SELECT USING (auth.role() = 'authenticated')","CREATE POLICY \\"Authenticated users can create events\\" ON events\nFOR INSERT WITH CHECK (auth.role() = 'authenticated')","CREATE POLICY \\"Authenticated users can update events\\" ON events\nFOR UPDATE USING (auth.role() = 'authenticated')","CREATE POLICY \\"Authenticated users can delete events\\" ON events\nFOR DELETE USING (auth.role() = 'authenticated')","CREATE POLICY \\"Authenticated users can view attendees\\" ON event_attendees\nFOR SELECT USING (auth.role() = 'authenticated')","CREATE POLICY \\"Authenticated users can manage attendees\\" ON event_attendees\nFOR ALL USING (auth.role() = 'authenticated')","-- =============================================================================\n-- 6. VIEW FOR EVENT STATS\n-- =============================================================================\n\nCREATE OR REPLACE VIEW event_stats AS\nSELECT \n    e.id,\n    e.name,\n    e.description,\n    e.event_date,\n    e.end_date,\n    e.location,\n    e.branch_id,\n    e.max_attendees,\n    e.points_reward,\n    e.status,\n    e.image_url,\n    e.created_at,\n    COUNT(ea.id) as total_invited,\n    COUNT(CASE WHEN ea.status = 'confirmed' THEN 1 END) as confirmed_count,\n    COUNT(CASE WHEN ea.status = 'attended' THEN 1 END) as attended_count,\n    COUNT(CASE WHEN ea.status = 'cancelled' THEN 1 END) as cancelled_count\nFROM events e\nLEFT JOIN event_attendees ea ON e.id = ea.event_id\nGROUP BY e.id, e.name, e.description, e.event_date, e.end_date, e.location, \n         e.branch_id, e.max_attendees, e.points_reward, e.status, e.image_url, e.created_at","-- Grant permissions\nGRANT SELECT ON event_stats TO authenticated","-- =============================================================================\n-- DONE!\n-- ============================================================================="}	05_events_system
20250123	{"-- =============================================================================\n-- Migration: Fix member_stats view - Prevent count multiplication\n-- Description: Recreate view with proper JOINs to avoid counting duplicates\n-- Date: 2025-01-10\n-- Version: 2 (Final)\n-- =============================================================================\n\n-- Drop existing view\nDROP VIEW IF EXISTS member_stats","-- Recreate view with corrected aggregations (using subqueries to avoid multiplication)\nCREATE VIEW member_stats AS\nSELECT \n    m.id,\n    m.full_name,\n    m.email,\n    m.phone,\n    m.membership_type,\n    m.status,\n    m.member_number,\n    m.points,\n    m.joined_date,\n    m.created_at,\n    m.updated_at,\n    -- Usage stats (from card_usage only)\n    COALESCE(usage_stats.total_visits, 0) as total_visits,\n    COALESCE(usage_stats.total_purchases, 0) as total_purchases,\n    COALESCE(usage_stats.total_events, 0) as total_events,\n    COALESCE(usage_stats.lifetime_spent, 0) as lifetime_spent,\n    COALESCE(usage_stats.visits_last_30_days, 0) as visits_last_30_days,\n    COALESCE(usage_stats.spent_last_30_days, 0) as spent_last_30_days,\n    COALESCE(usage_stats.visits_last_90_days, 0) as visits_last_90_days,\n    COALESCE(usage_stats.spent_last_90_days, 0) as spent_last_90_days,\n    usage_stats.last_visit,\n    COALESCE(usage_stats.average_purchase, 0) as average_purchase,\n    -- Promotions used (from applied_promotions)\n    COALESCE(promo_stats.promotions_used, 0) as promotions_used,\n    -- Wallet status (from wallet_passes)\n    COALESCE(wallet_stats.has_wallet, false) as has_wallet,\n    wallet_stats.wallet_types\nFROM members m\nLEFT JOIN (\n    -- Subquery for usage statistics (simplified - no event_type or amount_spent in initial schema)\n    SELECT \n        member_id,\n        COUNT(*) as total_visits,\n        0::bigint as total_purchases,\n        0::bigint as total_events,\n        0::numeric as lifetime_spent,\n        COUNT(*) FILTER (WHERE usage_date >= NOW() - INTERVAL '30 days') as visits_last_30_days,\n        0::numeric as spent_last_30_days,\n        COUNT(*) FILTER (WHERE usage_date >= NOW() - INTERVAL '90 days') as visits_last_90_days,\n        0::numeric as spent_last_90_days,\n        MAX(usage_date) as last_visit,\n        0::numeric as average_purchase\n    FROM card_usage\n    GROUP BY member_id\n) usage_stats ON m.id = usage_stats.member_id\nLEFT JOIN (\n    -- Subquery for promotions\n    SELECT \n        member_id,\n        COUNT(DISTINCT promotion_id) as promotions_used\n    FROM applied_promotions\n    GROUP BY member_id\n) promo_stats ON m.id = promo_stats.member_id\nLEFT JOIN (\n    -- Subquery for wallet status\n    SELECT \n        member_id,\n        COUNT(*) > 0 as has_wallet,\n        ARRAY_AGG(pass_type) as wallet_types\n    FROM wallet_passes\n    GROUP BY member_id\n) wallet_stats ON m.id = wallet_stats.member_id","-- Grant permissions\nGRANT SELECT ON member_stats TO authenticated","-- Add comment\nCOMMENT ON VIEW member_stats IS 'Aggregated member statistics with fixed JOIN logic to prevent count multiplication'"}	06_fix_member_stats_view
\.


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 1, false);


--
-- Name: key_key_id_seq; Type: SEQUENCE SET; Schema: pgsodium; Owner: supabase_admin
--

SELECT pg_catalog.setval('pgsodium.key_key_id_seq', 1, false);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: supabase_admin
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1, false);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('supabase_functions.hooks_id_seq', 1, false);


--
-- Name: extensions extensions_pkey; Type: CONSTRAINT; Schema: _realtime; Owner: supabase_admin
--

ALTER TABLE ONLY _realtime.extensions
    ADD CONSTRAINT extensions_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: _realtime; Owner: supabase_admin
--

ALTER TABLE ONLY _realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: _realtime; Owner: supabase_admin
--

ALTER TABLE ONLY _realtime.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: applied_promotions applied_promotions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applied_promotions
    ADD CONSTRAINT applied_promotions_pkey PRIMARY KEY (id);


--
-- Name: branches branches_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_name_key UNIQUE (name);


--
-- Name: branches branches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.branches
    ADD CONSTRAINT branches_pkey PRIMARY KEY (id);


--
-- Name: card_design_config card_design_config_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.card_design_config
    ADD CONSTRAINT card_design_config_name_key UNIQUE (name);


--
-- Name: card_design_config card_design_config_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.card_design_config
    ADD CONSTRAINT card_design_config_pkey PRIMARY KEY (id);


--
-- Name: card_usage card_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.card_usage
    ADD CONSTRAINT card_usage_pkey PRIMARY KEY (id);


--
-- Name: event_attendees event_attendees_event_id_member_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_attendees
    ADD CONSTRAINT event_attendees_event_id_member_id_key UNIQUE (event_id, member_id);


--
-- Name: event_attendees event_attendees_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_attendees
    ADD CONSTRAINT event_attendees_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: member_onboarding_responses member_onboarding_responses_member_id_question_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.member_onboarding_responses
    ADD CONSTRAINT member_onboarding_responses_member_id_question_id_key UNIQUE (member_id, question_id);


--
-- Name: member_onboarding_responses member_onboarding_responses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.member_onboarding_responses
    ADD CONSTRAINT member_onboarding_responses_pkey PRIMARY KEY (id);


--
-- Name: members members_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_email_key UNIQUE (email);


--
-- Name: members members_member_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_member_number_key UNIQUE (member_number);


--
-- Name: members members_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_pkey PRIMARY KEY (id);


--
-- Name: membership_types membership_types_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.membership_types
    ADD CONSTRAINT membership_types_name_key UNIQUE (name);


--
-- Name: membership_types membership_types_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.membership_types
    ADD CONSTRAINT membership_types_pkey PRIMARY KEY (id);


--
-- Name: onboarding_questions onboarding_questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.onboarding_questions
    ADD CONSTRAINT onboarding_questions_pkey PRIMARY KEY (id);


--
-- Name: promotions promotions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotions
    ADD CONSTRAINT promotions_pkey PRIMARY KEY (id);


--
-- Name: system_config system_config_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_config
    ADD CONSTRAINT system_config_pkey PRIMARY KEY (key);


--
-- Name: wallet_passes wallet_passes_pass_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallet_passes
    ADD CONSTRAINT wallet_passes_pass_id_key UNIQUE (pass_id);


--
-- Name: wallet_passes wallet_passes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallet_passes
    ADD CONSTRAINT wallet_passes_pkey PRIMARY KEY (id);


--
-- Name: wallet_push_notifications wallet_push_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallet_push_notifications
    ADD CONSTRAINT wallet_push_notifications_pkey PRIMARY KEY (id);


--
-- Name: wallet_push_tokens wallet_push_tokens_device_library_identifier_pass_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallet_push_tokens
    ADD CONSTRAINT wallet_push_tokens_device_library_identifier_pass_id_key UNIQUE (device_library_identifier, pass_id);


--
-- Name: wallet_push_tokens wallet_push_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallet_push_tokens
    ADD CONSTRAINT wallet_push_tokens_pkey PRIMARY KEY (id);


--
-- Name: wallet_push_tokens wallet_push_tokens_push_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallet_push_tokens
    ADD CONSTRAINT wallet_push_tokens_push_token_key UNIQUE (push_token);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_11_03 messages_2025_11_03_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_11_03
    ADD CONSTRAINT messages_2025_11_03_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_11_04 messages_2025_11_04_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_11_04
    ADD CONSTRAINT messages_2025_11_04_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_11_05 messages_2025_11_05_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_11_05
    ADD CONSTRAINT messages_2025_11_05_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_11_06 messages_2025_11_06_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_11_06
    ADD CONSTRAINT messages_2025_11_06_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_11_07 messages_2025_11_07_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.messages_2025_11_07
    ADD CONSTRAINT messages_2025_11_07_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: supabase_admin
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: hooks hooks_pkey; Type: CONSTRAINT; Schema: supabase_functions; Owner: supabase_functions_admin
--

ALTER TABLE ONLY supabase_functions.hooks
    ADD CONSTRAINT hooks_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: supabase_functions; Owner: supabase_functions_admin
--

ALTER TABLE ONLY supabase_functions.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (version);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: postgres
--

ALTER TABLE ONLY supabase_migrations.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: extensions_tenant_external_id_index; Type: INDEX; Schema: _realtime; Owner: supabase_admin
--

CREATE INDEX extensions_tenant_external_id_index ON _realtime.extensions USING btree (tenant_external_id);


--
-- Name: extensions_tenant_external_id_type_index; Type: INDEX; Schema: _realtime; Owner: supabase_admin
--

CREATE UNIQUE INDEX extensions_tenant_external_id_type_index ON _realtime.extensions USING btree (tenant_external_id, type);


--
-- Name: tenants_external_id_index; Type: INDEX; Schema: _realtime; Owner: supabase_admin
--

CREATE UNIQUE INDEX tenants_external_id_index ON _realtime.tenants USING btree (external_id);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: supabase_auth_admin
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: supabase_auth_admin
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: idx_applied_promotions_member_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_applied_promotions_member_id ON public.applied_promotions USING btree (member_id);


--
-- Name: idx_applied_promotions_promotion_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_applied_promotions_promotion_id ON public.applied_promotions USING btree (promotion_id);


--
-- Name: idx_branches_is_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_branches_is_active ON public.branches USING btree (is_active);


--
-- Name: idx_branches_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_branches_name ON public.branches USING btree (name);


--
-- Name: idx_card_design_config_default; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_card_design_config_default ON public.card_design_config USING btree (is_default) WHERE (is_default = true);


--
-- Name: idx_card_usage_branch_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_card_usage_branch_id ON public.card_usage USING btree (branch_id);


--
-- Name: idx_card_usage_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_card_usage_date ON public.card_usage USING btree (usage_date);


--
-- Name: idx_card_usage_member_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_card_usage_member_id ON public.card_usage USING btree (member_id);


--
-- Name: idx_card_usage_transaction_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_card_usage_transaction_id ON public.card_usage USING btree (transaction_id) WHERE (transaction_id IS NOT NULL);


--
-- Name: idx_card_usage_transaction_id_lookup; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_card_usage_transaction_id_lookup ON public.card_usage USING btree (transaction_id);


--
-- Name: idx_event_attendees_event; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_event_attendees_event ON public.event_attendees USING btree (event_id);


--
-- Name: idx_event_attendees_member; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_event_attendees_member ON public.event_attendees USING btree (member_id);


--
-- Name: idx_event_attendees_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_event_attendees_status ON public.event_attendees USING btree (status);


--
-- Name: idx_events_branch; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_events_branch ON public.events USING btree (branch_id);


--
-- Name: idx_events_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_events_date ON public.events USING btree (event_date);


--
-- Name: idx_events_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_events_status ON public.events USING btree (status);


--
-- Name: idx_member_responses_member; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_member_responses_member ON public.member_onboarding_responses USING btree (member_id);


--
-- Name: idx_member_responses_question; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_member_responses_question ON public.member_onboarding_responses USING btree (question_id);


--
-- Name: idx_members_birthday_month_day; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_members_birthday_month_day ON public.members USING btree (birth_month, birth_day);


--
-- Name: idx_members_date_of_birth; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_members_date_of_birth ON public.members USING btree (date_of_birth);


--
-- Name: idx_members_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_members_email ON public.members USING btree (email);


--
-- Name: idx_members_ghl_contact_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_members_ghl_contact_id ON public.members USING btree (ghl_contact_id);


--
-- Name: idx_members_member_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_members_member_number ON public.members USING btree (member_number);


--
-- Name: idx_members_phone_lookup; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_members_phone_lookup ON public.members USING btree (phone_country_code, phone_number);


--
-- Name: idx_members_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_members_status ON public.members USING btree (status);


--
-- Name: idx_members_user_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_members_user_id ON public.members USING btree (user_id);


--
-- Name: idx_onboarding_questions_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_onboarding_questions_active ON public.onboarding_questions USING btree (is_active);


--
-- Name: idx_onboarding_questions_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_onboarding_questions_order ON public.onboarding_questions USING btree (display_order) WHERE (is_active = true);


--
-- Name: idx_promotions_dates; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_promotions_dates ON public.promotions USING btree (start_date, end_date);


--
-- Name: idx_wallet_passes_member_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_wallet_passes_member_id ON public.wallet_passes USING btree (member_id);


--
-- Name: idx_wallet_push_notifications_sent_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_wallet_push_notifications_sent_at ON public.wallet_push_notifications USING btree (sent_at DESC);


--
-- Name: idx_wallet_push_tokens_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_wallet_push_tokens_active ON public.wallet_push_tokens USING btree (is_active) WHERE (is_active = true);


--
-- Name: idx_wallet_push_tokens_device; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_wallet_push_tokens_device ON public.wallet_push_tokens USING btree (device_library_identifier);


--
-- Name: idx_wallet_push_tokens_member; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_wallet_push_tokens_member ON public.wallet_push_tokens USING btree (member_id);


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: messages_inserted_at_topic_index; Type: INDEX; Schema: realtime; Owner: supabase_realtime_admin
--

CREATE INDEX messages_inserted_at_topic_index ON ONLY realtime.messages USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2025_11_03_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX messages_2025_11_03_inserted_at_topic_idx ON realtime.messages_2025_11_03 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2025_11_04_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX messages_2025_11_04_inserted_at_topic_idx ON realtime.messages_2025_11_04 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2025_11_05_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX messages_2025_11_05_inserted_at_topic_idx ON realtime.messages_2025_11_05 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2025_11_06_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX messages_2025_11_06_inserted_at_topic_idx ON realtime.messages_2025_11_06 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: messages_2025_11_07_inserted_at_topic_idx; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE INDEX messages_2025_11_07_inserted_at_topic_idx ON realtime.messages_2025_11_07 USING btree (inserted_at DESC, topic) WHERE ((extension = 'broadcast'::text) AND (private IS TRUE));


--
-- Name: subscription_subscription_id_entity_filters_key; Type: INDEX; Schema: realtime; Owner: supabase_admin
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_key ON realtime.subscription USING btree (subscription_id, entity, filters);


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: supabase_storage_admin
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: supabase_functions_hooks_h_table_id_h_name_idx; Type: INDEX; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE INDEX supabase_functions_hooks_h_table_id_h_name_idx ON supabase_functions.hooks USING btree (hook_table_id, hook_name);


--
-- Name: supabase_functions_hooks_request_id_idx; Type: INDEX; Schema: supabase_functions; Owner: supabase_functions_admin
--

CREATE INDEX supabase_functions_hooks_request_id_idx ON supabase_functions.hooks USING btree (request_id);


--
-- Name: messages_2025_11_03_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_11_03_inserted_at_topic_idx;


--
-- Name: messages_2025_11_03_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_11_03_pkey;


--
-- Name: messages_2025_11_04_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_11_04_inserted_at_topic_idx;


--
-- Name: messages_2025_11_04_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_11_04_pkey;


--
-- Name: messages_2025_11_05_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_11_05_inserted_at_topic_idx;


--
-- Name: messages_2025_11_05_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_11_05_pkey;


--
-- Name: messages_2025_11_06_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_11_06_inserted_at_topic_idx;


--
-- Name: messages_2025_11_06_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_11_06_pkey;


--
-- Name: messages_2025_11_07_inserted_at_topic_idx; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_inserted_at_topic_index ATTACH PARTITION realtime.messages_2025_11_07_inserted_at_topic_idx;


--
-- Name: messages_2025_11_07_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_11_07_pkey;


--
-- Name: branches update_branches_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON public.branches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: card_design_config update_card_design_config_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_card_design_config_updated_at BEFORE UPDATE ON public.card_design_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: events update_events_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: member_onboarding_responses update_member_responses_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_member_responses_updated_at BEFORE UPDATE ON public.member_onboarding_responses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: members update_members_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON public.members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: membership_types update_membership_types_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_membership_types_updated_at BEFORE UPDATE ON public.membership_types FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: onboarding_questions update_onboarding_questions_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_onboarding_questions_updated_at BEFORE UPDATE ON public.onboarding_questions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: promotions update_promotions_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_promotions_updated_at BEFORE UPDATE ON public.promotions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: system_config update_system_config_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_system_config_updated_at BEFORE UPDATE ON public.system_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: wallet_push_tokens update_wallet_push_tokens_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_wallet_push_tokens_updated_at BEFORE UPDATE ON public.wallet_push_tokens FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: supabase_admin
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: supabase_storage_admin
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: extensions extensions_tenant_external_id_fkey; Type: FK CONSTRAINT; Schema: _realtime; Owner: supabase_admin
--

ALTER TABLE ONLY _realtime.extensions
    ADD CONSTRAINT extensions_tenant_external_id_fkey FOREIGN KEY (tenant_external_id) REFERENCES _realtime.tenants(external_id) ON DELETE CASCADE;


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: applied_promotions applied_promotions_card_usage_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applied_promotions
    ADD CONSTRAINT applied_promotions_card_usage_id_fkey FOREIGN KEY (card_usage_id) REFERENCES public.card_usage(id) ON DELETE SET NULL;


--
-- Name: applied_promotions applied_promotions_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applied_promotions
    ADD CONSTRAINT applied_promotions_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id) ON DELETE CASCADE;


--
-- Name: applied_promotions applied_promotions_promotion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applied_promotions
    ADD CONSTRAINT applied_promotions_promotion_id_fkey FOREIGN KEY (promotion_id) REFERENCES public.promotions(id) ON DELETE CASCADE;


--
-- Name: card_usage card_usage_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.card_usage
    ADD CONSTRAINT card_usage_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- Name: card_usage card_usage_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.card_usage
    ADD CONSTRAINT card_usage_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id) ON DELETE CASCADE;


--
-- Name: event_attendees event_attendees_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_attendees
    ADD CONSTRAINT event_attendees_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;


--
-- Name: event_attendees event_attendees_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.event_attendees
    ADD CONSTRAINT event_attendees_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id) ON DELETE CASCADE;


--
-- Name: events events_branch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_branch_id_fkey FOREIGN KEY (branch_id) REFERENCES public.branches(id);


--
-- Name: events events_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id);


--
-- Name: member_onboarding_responses member_onboarding_responses_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.member_onboarding_responses
    ADD CONSTRAINT member_onboarding_responses_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id) ON DELETE CASCADE;


--
-- Name: member_onboarding_responses member_onboarding_responses_question_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.member_onboarding_responses
    ADD CONSTRAINT member_onboarding_responses_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.onboarding_questions(id) ON DELETE CASCADE;


--
-- Name: members members_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: system_config system_config_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_config
    ADD CONSTRAINT system_config_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id);


--
-- Name: wallet_passes wallet_passes_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallet_passes
    ADD CONSTRAINT wallet_passes_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id) ON DELETE CASCADE;


--
-- Name: wallet_push_notifications wallet_push_notifications_sent_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallet_push_notifications
    ADD CONSTRAINT wallet_push_notifications_sent_by_fkey FOREIGN KEY (sent_by) REFERENCES auth.users(id);


--
-- Name: wallet_push_tokens wallet_push_tokens_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallet_push_tokens
    ADD CONSTRAINT wallet_push_tokens_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id) ON DELETE CASCADE;


--
-- Name: wallet_push_tokens wallet_push_tokens_pass_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.wallet_push_tokens
    ADD CONSTRAINT wallet_push_tokens_pass_id_fkey FOREIGN KEY (pass_id) REFERENCES public.wallet_passes(id) ON DELETE CASCADE;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: supabase_auth_admin
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: onboarding_questions Anyone can view active onboarding questions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view active onboarding questions" ON public.onboarding_questions FOR SELECT USING ((is_active = true));


--
-- Name: membership_types Anyone can view membership types; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view membership types" ON public.membership_types FOR SELECT USING (true);


--
-- Name: system_config Anyone can view system config; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Anyone can view system config" ON public.system_config FOR SELECT USING (true);


--
-- Name: branches Authenticated users can create branches; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can create branches" ON public.branches FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: events Authenticated users can create events; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can create events" ON public.events FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: wallet_push_notifications Authenticated users can create wallet notifications; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can create wallet notifications" ON public.wallet_push_notifications FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: applied_promotions Authenticated users can delete applied promotions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can delete applied promotions" ON public.applied_promotions FOR DELETE USING ((auth.role() = 'authenticated'::text));


--
-- Name: branches Authenticated users can delete branches; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can delete branches" ON public.branches FOR DELETE USING ((auth.role() = 'authenticated'::text));


--
-- Name: card_design_config Authenticated users can delete card designs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can delete card designs" ON public.card_design_config FOR DELETE USING ((auth.role() = 'authenticated'::text));


--
-- Name: card_usage Authenticated users can delete card usage; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can delete card usage" ON public.card_usage FOR DELETE USING ((auth.role() = 'authenticated'::text));


--
-- Name: events Authenticated users can delete events; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can delete events" ON public.events FOR DELETE USING ((auth.role() = 'authenticated'::text));


--
-- Name: members Authenticated users can delete members; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can delete members" ON public.members FOR DELETE USING ((auth.role() = 'authenticated'::text));


--
-- Name: promotions Authenticated users can delete promotions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can delete promotions" ON public.promotions FOR DELETE USING ((auth.role() = 'authenticated'::text));


--
-- Name: onboarding_questions Authenticated users can delete questions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can delete questions" ON public.onboarding_questions FOR DELETE USING ((auth.role() = 'authenticated'::text));


--
-- Name: wallet_passes Authenticated users can delete wallet passes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can delete wallet passes" ON public.wallet_passes FOR DELETE USING ((auth.role() = 'authenticated'::text));


--
-- Name: applied_promotions Authenticated users can insert applied promotions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can insert applied promotions" ON public.applied_promotions FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: card_design_config Authenticated users can insert card designs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can insert card designs" ON public.card_design_config FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: card_usage Authenticated users can insert card usage; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can insert card usage" ON public.card_usage FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: members Authenticated users can insert members; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can insert members" ON public.members FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: promotions Authenticated users can insert promotions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can insert promotions" ON public.promotions FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: onboarding_questions Authenticated users can insert questions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can insert questions" ON public.onboarding_questions FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: wallet_passes Authenticated users can insert wallet passes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can insert wallet passes" ON public.wallet_passes FOR INSERT WITH CHECK ((auth.role() = 'authenticated'::text));


--
-- Name: event_attendees Authenticated users can manage attendees; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can manage attendees" ON public.event_attendees USING ((auth.role() = 'authenticated'::text));


--
-- Name: wallet_push_tokens Authenticated users can manage wallet tokens; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can manage wallet tokens" ON public.wallet_push_tokens USING ((auth.role() = 'authenticated'::text));


--
-- Name: applied_promotions Authenticated users can update applied promotions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can update applied promotions" ON public.applied_promotions FOR UPDATE USING ((auth.role() = 'authenticated'::text));


--
-- Name: branches Authenticated users can update branches; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can update branches" ON public.branches FOR UPDATE USING ((auth.role() = 'authenticated'::text));


--
-- Name: card_design_config Authenticated users can update card designs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can update card designs" ON public.card_design_config FOR UPDATE USING ((auth.role() = 'authenticated'::text));


--
-- Name: card_usage Authenticated users can update card usage; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can update card usage" ON public.card_usage FOR UPDATE USING ((auth.role() = 'authenticated'::text));


--
-- Name: system_config Authenticated users can update config; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can update config" ON public.system_config FOR UPDATE USING ((auth.role() = 'authenticated'::text));


--
-- Name: events Authenticated users can update events; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can update events" ON public.events FOR UPDATE USING ((auth.role() = 'authenticated'::text));


--
-- Name: members Authenticated users can update members; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can update members" ON public.members FOR UPDATE USING ((auth.role() = 'authenticated'::text));


--
-- Name: promotions Authenticated users can update promotions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can update promotions" ON public.promotions FOR UPDATE USING ((auth.role() = 'authenticated'::text));


--
-- Name: onboarding_questions Authenticated users can update questions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can update questions" ON public.onboarding_questions FOR UPDATE USING ((auth.role() = 'authenticated'::text));


--
-- Name: member_onboarding_responses Authenticated users can update responses; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can update responses" ON public.member_onboarding_responses FOR UPDATE USING ((auth.role() = 'authenticated'::text));


--
-- Name: wallet_passes Authenticated users can update wallet passes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can update wallet passes" ON public.wallet_passes FOR UPDATE USING ((auth.role() = 'authenticated'::text));


--
-- Name: applied_promotions Authenticated users can view all applied promotions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view all applied promotions" ON public.applied_promotions FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: card_design_config Authenticated users can view all card designs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view all card designs" ON public.card_design_config FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: card_usage Authenticated users can view all card usage; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view all card usage" ON public.card_usage FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: members Authenticated users can view all members; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view all members" ON public.members FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: promotions Authenticated users can view all promotions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view all promotions" ON public.promotions FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: onboarding_questions Authenticated users can view all questions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view all questions" ON public.onboarding_questions FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: member_onboarding_responses Authenticated users can view all responses; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view all responses" ON public.member_onboarding_responses FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: wallet_passes Authenticated users can view all wallet passes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view all wallet passes" ON public.wallet_passes FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: event_attendees Authenticated users can view attendees; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view attendees" ON public.event_attendees FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: branches Authenticated users can view branches; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view branches" ON public.branches FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: events Authenticated users can view events; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view events" ON public.events FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: wallet_push_notifications Authenticated users can view wallet notifications; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view wallet notifications" ON public.wallet_push_notifications FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: wallet_push_tokens Authenticated users can view wallet tokens; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Authenticated users can view wallet tokens" ON public.wallet_push_tokens FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: member_onboarding_responses Members can insert their responses; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Members can insert their responses" ON public.member_onboarding_responses FOR INSERT WITH CHECK (true);


--
-- Name: member_onboarding_responses Members can view their own responses; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Members can view their own responses" ON public.member_onboarding_responses FOR SELECT USING (true);


--
-- Name: applied_promotions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.applied_promotions ENABLE ROW LEVEL SECURITY;

--
-- Name: branches; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

--
-- Name: card_design_config; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.card_design_config ENABLE ROW LEVEL SECURITY;

--
-- Name: card_usage; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.card_usage ENABLE ROW LEVEL SECURITY;

--
-- Name: event_attendees; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;

--
-- Name: events; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

--
-- Name: member_onboarding_responses; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.member_onboarding_responses ENABLE ROW LEVEL SECURITY;

--
-- Name: members; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

--
-- Name: membership_types; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.membership_types ENABLE ROW LEVEL SECURITY;

--
-- Name: onboarding_questions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.onboarding_questions ENABLE ROW LEVEL SECURITY;

--
-- Name: promotions; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

--
-- Name: system_config; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

--
-- Name: wallet_passes; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.wallet_passes ENABLE ROW LEVEL SECURITY;

--
-- Name: wallet_push_notifications; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.wallet_push_notifications ENABLE ROW LEVEL SECURITY;

--
-- Name: wallet_push_tokens; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.wallet_push_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: supabase_realtime_admin
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: supabase_storage_admin
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: postgres
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


ALTER PUBLICATION supabase_realtime OWNER TO postgres;

--
-- Name: SCHEMA auth; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA auth TO anon;
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT ALL ON SCHEMA auth TO supabase_auth_admin;
GRANT ALL ON SCHEMA auth TO dashboard_user;
GRANT ALL ON SCHEMA auth TO postgres;


--
-- Name: SCHEMA extensions; Type: ACL; Schema: -; Owner: postgres
--

GRANT USAGE ON SCHEMA extensions TO anon;
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO service_role;
GRANT ALL ON SCHEMA extensions TO dashboard_user;


--
-- Name: SCHEMA net; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA net TO supabase_functions_admin;
GRANT USAGE ON SCHEMA net TO postgres;
GRANT USAGE ON SCHEMA net TO anon;
GRANT USAGE ON SCHEMA net TO authenticated;
GRANT USAGE ON SCHEMA net TO service_role;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- Name: SCHEMA realtime; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA realtime TO postgres;
GRANT USAGE ON SCHEMA realtime TO anon;
GRANT USAGE ON SCHEMA realtime TO authenticated;
GRANT USAGE ON SCHEMA realtime TO service_role;
GRANT ALL ON SCHEMA realtime TO supabase_realtime_admin;


--
-- Name: SCHEMA storage; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT ALL ON SCHEMA storage TO postgres;
GRANT USAGE ON SCHEMA storage TO anon;
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT USAGE ON SCHEMA storage TO service_role;
GRANT ALL ON SCHEMA storage TO supabase_storage_admin;
GRANT ALL ON SCHEMA storage TO dashboard_user;


--
-- Name: SCHEMA supabase_functions; Type: ACL; Schema: -; Owner: supabase_admin
--

GRANT USAGE ON SCHEMA supabase_functions TO postgres;
GRANT USAGE ON SCHEMA supabase_functions TO anon;
GRANT USAGE ON SCHEMA supabase_functions TO authenticated;
GRANT USAGE ON SCHEMA supabase_functions TO service_role;
GRANT ALL ON SCHEMA supabase_functions TO supabase_functions_admin;


--
-- Name: FUNCTION email(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.email() TO dashboard_user;


--
-- Name: FUNCTION jwt(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.jwt() TO postgres;
GRANT ALL ON FUNCTION auth.jwt() TO dashboard_user;


--
-- Name: FUNCTION role(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.role() TO dashboard_user;


--
-- Name: FUNCTION uid(); Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON FUNCTION auth.uid() TO dashboard_user;


--
-- Name: FUNCTION algorithm_sign(signables text, secret text, algorithm text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.algorithm_sign(signables text, secret text, algorithm text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.algorithm_sign(signables text, secret text, algorithm text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION armor(bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.armor(bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.armor(bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION armor(bytea, text[], text[]); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.armor(bytea, text[], text[]) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION crypt(text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.crypt(text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.crypt(text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION dearmor(text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.dearmor(text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.dearmor(text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION decrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.decrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION digest(bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.digest(bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION digest(text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.digest(text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.digest(text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION encrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.encrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION encrypt_iv(bytea, bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.encrypt_iv(bytea, bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION gen_random_bytes(integer); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.gen_random_bytes(integer) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION gen_random_uuid(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.gen_random_uuid() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION gen_salt(text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gen_salt(text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.gen_salt(text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION gen_salt(text, integer); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.gen_salt(text, integer) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.grant_pg_cron_access() FROM postgres;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_cron_access() TO dashboard_user;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.grant_pg_graphql_access() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION grant_pg_net_access(); Type: ACL; Schema: extensions; Owner: postgres
--

REVOKE ALL ON FUNCTION extensions.grant_pg_net_access() FROM postgres;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO postgres WITH GRANT OPTION;
GRANT ALL ON FUNCTION extensions.grant_pg_net_access() TO dashboard_user;


--
-- Name: FUNCTION hmac(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.hmac(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION hmac(text, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.hmac(text, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT blk_read_time double precision, OUT blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pg_stat_statements(showtext boolean, OUT userid oid, OUT dbid oid, OUT toplevel boolean, OUT queryid bigint, OUT query text, OUT plans bigint, OUT total_plan_time double precision, OUT min_plan_time double precision, OUT max_plan_time double precision, OUT mean_plan_time double precision, OUT stddev_plan_time double precision, OUT calls bigint, OUT total_exec_time double precision, OUT min_exec_time double precision, OUT max_exec_time double precision, OUT mean_exec_time double precision, OUT stddev_exec_time double precision, OUT rows bigint, OUT shared_blks_hit bigint, OUT shared_blks_read bigint, OUT shared_blks_dirtied bigint, OUT shared_blks_written bigint, OUT local_blks_hit bigint, OUT local_blks_read bigint, OUT local_blks_dirtied bigint, OUT local_blks_written bigint, OUT temp_blks_read bigint, OUT temp_blks_written bigint, OUT blk_read_time double precision, OUT blk_write_time double precision, OUT temp_blk_read_time double precision, OUT temp_blk_write_time double precision, OUT wal_records bigint, OUT wal_fpi bigint, OUT wal_bytes numeric, OUT jit_functions bigint, OUT jit_generation_time double precision, OUT jit_inlining_count bigint, OUT jit_inlining_time double precision, OUT jit_optimization_count bigint, OUT jit_optimization_time double precision, OUT jit_emission_count bigint, OUT jit_emission_time double precision) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pg_stat_statements_info(OUT dealloc bigint, OUT stats_reset timestamp with time zone) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pg_stat_statements_reset(userid oid, dbid oid, queryid bigint); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_armor_headers(text, OUT key text, OUT value text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_armor_headers(text, OUT key text, OUT value text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_key_id(bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_key_id(bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_decrypt_bytea(bytea, bytea, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_decrypt_bytea(bytea, bytea, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_encrypt(text, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt(text, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_pub_encrypt_bytea(bytea, bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_pub_encrypt_bytea(bytea, bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_decrypt(bytea, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt(bytea, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_decrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_decrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_encrypt(text, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt(text, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgp_sym_encrypt_bytea(bytea, text, text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.pgp_sym_encrypt_bytea(bytea, text, text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgrst_ddl_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_ddl_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION pgrst_drop_watch(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.pgrst_drop_watch() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.set_graphql_placeholder() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION sign(payload json, secret text, algorithm text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.sign(payload json, secret text, algorithm text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.sign(payload json, secret text, algorithm text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION try_cast_double(inp text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.try_cast_double(inp text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.try_cast_double(inp text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION url_decode(data text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.url_decode(data text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.url_decode(data text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION url_encode(data bytea); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.url_encode(data bytea) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.url_encode(data bytea) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v1(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v1mc(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_generate_v1mc() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v3(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_generate_v3(namespace uuid, name text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v4(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_generate_v4() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_generate_v5(namespace uuid, name text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_generate_v5(namespace uuid, name text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_nil(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_nil() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_nil() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_ns_dns(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_ns_dns() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_ns_oid(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_ns_oid() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_ns_url(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_ns_url() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION uuid_ns_x500(); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO dashboard_user;
GRANT ALL ON FUNCTION extensions.uuid_ns_x500() TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION verify(token text, secret text, algorithm text); Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON FUNCTION extensions.verify(token text, secret text, algorithm text) TO dashboard_user;
GRANT ALL ON FUNCTION extensions.verify(token text, secret text, algorithm text) TO postgres WITH GRANT OPTION;


--
-- Name: FUNCTION graphql("operationName" text, query text, variables jsonb, extensions jsonb); Type: ACL; Schema: graphql_public; Owner: supabase_admin
--

GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO postgres;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO anon;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO authenticated;
GRANT ALL ON FUNCTION graphql_public.graphql("operationName" text, query text, variables jsonb, extensions jsonb) TO service_role;


--
-- Name: FUNCTION http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer); Type: ACL; Schema: net; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
GRANT ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin;
GRANT ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO postgres;
GRANT ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO anon;
GRANT ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO authenticated;
GRANT ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO service_role;


--
-- Name: FUNCTION http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer); Type: ACL; Schema: net; Owner: supabase_admin
--

REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
GRANT ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin;
GRANT ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO postgres;
GRANT ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO anon;
GRANT ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO authenticated;
GRANT ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO service_role;


--
-- Name: FUNCTION get_auth(p_usename text); Type: ACL; Schema: pgbouncer; Owner: postgres
--

REVOKE ALL ON FUNCTION pgbouncer.get_auth(p_usename text) FROM PUBLIC;
GRANT ALL ON FUNCTION pgbouncer.get_auth(p_usename text) TO pgbouncer;


--
-- Name: FUNCTION crypto_aead_det_decrypt(message bytea, additional bytea, key_uuid uuid, nonce bytea); Type: ACL; Schema: pgsodium; Owner: pgsodium_keymaker
--

GRANT ALL ON FUNCTION pgsodium.crypto_aead_det_decrypt(message bytea, additional bytea, key_uuid uuid, nonce bytea) TO service_role;


--
-- Name: FUNCTION crypto_aead_det_encrypt(message bytea, additional bytea, key_uuid uuid, nonce bytea); Type: ACL; Schema: pgsodium; Owner: pgsodium_keymaker
--

GRANT ALL ON FUNCTION pgsodium.crypto_aead_det_encrypt(message bytea, additional bytea, key_uuid uuid, nonce bytea) TO service_role;


--
-- Name: FUNCTION crypto_aead_det_keygen(); Type: ACL; Schema: pgsodium; Owner: supabase_admin
--

GRANT ALL ON FUNCTION pgsodium.crypto_aead_det_keygen() TO service_role;


--
-- Name: FUNCTION get_member_onboarding_status(member_uuid uuid); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_member_onboarding_status(member_uuid uuid) TO anon;
GRANT ALL ON FUNCTION public.get_member_onboarding_status(member_uuid uuid) TO authenticated;
GRANT ALL ON FUNCTION public.get_member_onboarding_status(member_uuid uuid) TO service_role;


--
-- Name: FUNCTION get_upcoming_birthdays(days_ahead integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.get_upcoming_birthdays(days_ahead integer) TO anon;
GRANT ALL ON FUNCTION public.get_upcoming_birthdays(days_ahead integer) TO authenticated;
GRANT ALL ON FUNCTION public.get_upcoming_birthdays(days_ahead integer) TO service_role;


--
-- Name: FUNCTION reorder_onboarding_question(question_uuid uuid, new_order integer); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.reorder_onboarding_question(question_uuid uuid, new_order integer) TO anon;
GRANT ALL ON FUNCTION public.reorder_onboarding_question(question_uuid uuid, new_order integer) TO authenticated;
GRANT ALL ON FUNCTION public.reorder_onboarding_question(question_uuid uuid, new_order integer) TO service_role;


--
-- Name: FUNCTION update_updated_at_column(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_updated_at_column() TO anon;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO authenticated;
GRANT ALL ON FUNCTION public.update_updated_at_column() TO service_role;


--
-- Name: FUNCTION validate_phone_number(country_code character varying, phone_num character varying); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.validate_phone_number(country_code character varying, phone_num character varying) TO anon;
GRANT ALL ON FUNCTION public.validate_phone_number(country_code character varying, phone_num character varying) TO authenticated;
GRANT ALL ON FUNCTION public.validate_phone_number(country_code character varying, phone_num character varying) TO service_role;


--
-- Name: FUNCTION apply_rls(wal jsonb, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer) TO supabase_realtime_admin;


--
-- Name: FUNCTION broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO postgres;
GRANT ALL ON FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text) TO dashboard_user;


--
-- Name: FUNCTION build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO postgres;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO anon;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO service_role;
GRANT ALL ON FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) TO supabase_realtime_admin;


--
-- Name: FUNCTION "cast"(val text, type_ regtype); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO postgres;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO dashboard_user;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO anon;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO authenticated;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO service_role;
GRANT ALL ON FUNCTION realtime."cast"(val text, type_ regtype) TO supabase_realtime_admin;


--
-- Name: FUNCTION check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO postgres;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO anon;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO authenticated;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO service_role;
GRANT ALL ON FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) TO supabase_realtime_admin;


--
-- Name: FUNCTION is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO postgres;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO anon;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO authenticated;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO service_role;
GRANT ALL ON FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) TO supabase_realtime_admin;


--
-- Name: FUNCTION list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO postgres;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO anon;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO authenticated;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO service_role;
GRANT ALL ON FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) TO supabase_realtime_admin;


--
-- Name: FUNCTION quote_wal2json(entity regclass); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO postgres;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO anon;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO authenticated;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO service_role;
GRANT ALL ON FUNCTION realtime.quote_wal2json(entity regclass) TO supabase_realtime_admin;


--
-- Name: FUNCTION send(payload jsonb, event text, topic text, private boolean); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO postgres;
GRANT ALL ON FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean) TO dashboard_user;


--
-- Name: FUNCTION subscription_check_filters(); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO postgres;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO dashboard_user;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO anon;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO authenticated;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO service_role;
GRANT ALL ON FUNCTION realtime.subscription_check_filters() TO supabase_realtime_admin;


--
-- Name: FUNCTION to_regrole(role_name text); Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO postgres;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO dashboard_user;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO anon;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO authenticated;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO service_role;
GRANT ALL ON FUNCTION realtime.to_regrole(role_name text) TO supabase_realtime_admin;


--
-- Name: FUNCTION topic(); Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON FUNCTION realtime.topic() TO postgres;
GRANT ALL ON FUNCTION realtime.topic() TO dashboard_user;


--
-- Name: FUNCTION http_request(); Type: ACL; Schema: supabase_functions; Owner: supabase_functions_admin
--

REVOKE ALL ON FUNCTION supabase_functions.http_request() FROM PUBLIC;
GRANT ALL ON FUNCTION supabase_functions.http_request() TO postgres;
GRANT ALL ON FUNCTION supabase_functions.http_request() TO anon;
GRANT ALL ON FUNCTION supabase_functions.http_request() TO authenticated;
GRANT ALL ON FUNCTION supabase_functions.http_request() TO service_role;


--
-- Name: TABLE audit_log_entries; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.audit_log_entries TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.audit_log_entries TO postgres;
GRANT SELECT ON TABLE auth.audit_log_entries TO postgres WITH GRANT OPTION;


--
-- Name: TABLE flow_state; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.flow_state TO postgres;
GRANT SELECT ON TABLE auth.flow_state TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.flow_state TO dashboard_user;


--
-- Name: TABLE identities; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.identities TO postgres;
GRANT SELECT ON TABLE auth.identities TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.identities TO dashboard_user;


--
-- Name: TABLE instances; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.instances TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.instances TO postgres;
GRANT SELECT ON TABLE auth.instances TO postgres WITH GRANT OPTION;


--
-- Name: TABLE mfa_amr_claims; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.mfa_amr_claims TO postgres;
GRANT SELECT ON TABLE auth.mfa_amr_claims TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_amr_claims TO dashboard_user;


--
-- Name: TABLE mfa_challenges; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.mfa_challenges TO postgres;
GRANT SELECT ON TABLE auth.mfa_challenges TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_challenges TO dashboard_user;


--
-- Name: TABLE mfa_factors; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.mfa_factors TO postgres;
GRANT SELECT ON TABLE auth.mfa_factors TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.mfa_factors TO dashboard_user;


--
-- Name: TABLE one_time_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.one_time_tokens TO postgres;
GRANT SELECT ON TABLE auth.one_time_tokens TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.one_time_tokens TO dashboard_user;


--
-- Name: TABLE refresh_tokens; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.refresh_tokens TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.refresh_tokens TO postgres;
GRANT SELECT ON TABLE auth.refresh_tokens TO postgres WITH GRANT OPTION;


--
-- Name: SEQUENCE refresh_tokens_id_seq; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO dashboard_user;
GRANT ALL ON SEQUENCE auth.refresh_tokens_id_seq TO postgres;


--
-- Name: TABLE saml_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.saml_providers TO postgres;
GRANT SELECT ON TABLE auth.saml_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_providers TO dashboard_user;


--
-- Name: TABLE saml_relay_states; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.saml_relay_states TO postgres;
GRANT SELECT ON TABLE auth.saml_relay_states TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.saml_relay_states TO dashboard_user;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.schema_migrations TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.schema_migrations TO postgres;
GRANT SELECT ON TABLE auth.schema_migrations TO postgres WITH GRANT OPTION;


--
-- Name: TABLE sessions; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.sessions TO postgres;
GRANT SELECT ON TABLE auth.sessions TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sessions TO dashboard_user;


--
-- Name: TABLE sso_domains; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.sso_domains TO postgres;
GRANT SELECT ON TABLE auth.sso_domains TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_domains TO dashboard_user;


--
-- Name: TABLE sso_providers; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.sso_providers TO postgres;
GRANT SELECT ON TABLE auth.sso_providers TO postgres WITH GRANT OPTION;
GRANT ALL ON TABLE auth.sso_providers TO dashboard_user;


--
-- Name: TABLE users; Type: ACL; Schema: auth; Owner: supabase_auth_admin
--

GRANT ALL ON TABLE auth.users TO dashboard_user;
GRANT INSERT,REFERENCES,DELETE,TRIGGER,TRUNCATE,UPDATE ON TABLE auth.users TO postgres;
GRANT SELECT ON TABLE auth.users TO postgres WITH GRANT OPTION;


--
-- Name: TABLE pg_stat_statements; Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON TABLE extensions.pg_stat_statements TO postgres WITH GRANT OPTION;


--
-- Name: TABLE pg_stat_statements_info; Type: ACL; Schema: extensions; Owner: supabase_admin
--

GRANT ALL ON TABLE extensions.pg_stat_statements_info TO postgres WITH GRANT OPTION;


--
-- Name: TABLE decrypted_key; Type: ACL; Schema: pgsodium; Owner: supabase_admin
--

GRANT ALL ON TABLE pgsodium.decrypted_key TO pgsodium_keyholder;


--
-- Name: TABLE masking_rule; Type: ACL; Schema: pgsodium; Owner: supabase_admin
--

GRANT ALL ON TABLE pgsodium.masking_rule TO pgsodium_keyholder;


--
-- Name: TABLE mask_columns; Type: ACL; Schema: pgsodium; Owner: supabase_admin
--

GRANT ALL ON TABLE pgsodium.mask_columns TO pgsodium_keyholder;


--
-- Name: TABLE applied_promotions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.applied_promotions TO anon;
GRANT ALL ON TABLE public.applied_promotions TO authenticated;
GRANT ALL ON TABLE public.applied_promotions TO service_role;


--
-- Name: TABLE branches; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.branches TO anon;
GRANT ALL ON TABLE public.branches TO authenticated;
GRANT ALL ON TABLE public.branches TO service_role;


--
-- Name: TABLE card_usage; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.card_usage TO anon;
GRANT ALL ON TABLE public.card_usage TO authenticated;
GRANT ALL ON TABLE public.card_usage TO service_role;


--
-- Name: TABLE branch_stats; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.branch_stats TO anon;
GRANT ALL ON TABLE public.branch_stats TO authenticated;
GRANT ALL ON TABLE public.branch_stats TO service_role;


--
-- Name: TABLE card_design_config; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.card_design_config TO anon;
GRANT ALL ON TABLE public.card_design_config TO authenticated;
GRANT ALL ON TABLE public.card_design_config TO service_role;


--
-- Name: TABLE event_attendees; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.event_attendees TO anon;
GRANT ALL ON TABLE public.event_attendees TO authenticated;
GRANT ALL ON TABLE public.event_attendees TO service_role;


--
-- Name: TABLE events; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.events TO anon;
GRANT ALL ON TABLE public.events TO authenticated;
GRANT ALL ON TABLE public.events TO service_role;


--
-- Name: TABLE event_stats; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.event_stats TO anon;
GRANT ALL ON TABLE public.event_stats TO authenticated;
GRANT ALL ON TABLE public.event_stats TO service_role;


--
-- Name: TABLE member_onboarding_responses; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.member_onboarding_responses TO anon;
GRANT ALL ON TABLE public.member_onboarding_responses TO authenticated;
GRANT ALL ON TABLE public.member_onboarding_responses TO service_role;


--
-- Name: TABLE members; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.members TO anon;
GRANT ALL ON TABLE public.members TO authenticated;
GRANT ALL ON TABLE public.members TO service_role;


--
-- Name: TABLE wallet_passes; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.wallet_passes TO anon;
GRANT ALL ON TABLE public.wallet_passes TO authenticated;
GRANT ALL ON TABLE public.wallet_passes TO service_role;


--
-- Name: TABLE member_stats; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.member_stats TO anon;
GRANT ALL ON TABLE public.member_stats TO authenticated;
GRANT ALL ON TABLE public.member_stats TO service_role;


--
-- Name: TABLE membership_types; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.membership_types TO anon;
GRANT ALL ON TABLE public.membership_types TO authenticated;
GRANT ALL ON TABLE public.membership_types TO service_role;


--
-- Name: TABLE onboarding_questions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.onboarding_questions TO anon;
GRANT ALL ON TABLE public.onboarding_questions TO authenticated;
GRANT ALL ON TABLE public.onboarding_questions TO service_role;


--
-- Name: TABLE onboarding_response_stats; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.onboarding_response_stats TO anon;
GRANT ALL ON TABLE public.onboarding_response_stats TO authenticated;
GRANT ALL ON TABLE public.onboarding_response_stats TO service_role;


--
-- Name: TABLE promotions; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.promotions TO anon;
GRANT ALL ON TABLE public.promotions TO authenticated;
GRANT ALL ON TABLE public.promotions TO service_role;


--
-- Name: TABLE system_config; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.system_config TO anon;
GRANT ALL ON TABLE public.system_config TO authenticated;
GRANT ALL ON TABLE public.system_config TO service_role;


--
-- Name: TABLE wallet_push_notifications; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.wallet_push_notifications TO anon;
GRANT ALL ON TABLE public.wallet_push_notifications TO authenticated;
GRANT ALL ON TABLE public.wallet_push_notifications TO service_role;


--
-- Name: TABLE wallet_push_tokens; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.wallet_push_tokens TO anon;
GRANT ALL ON TABLE public.wallet_push_tokens TO authenticated;
GRANT ALL ON TABLE public.wallet_push_tokens TO service_role;


--
-- Name: TABLE messages; Type: ACL; Schema: realtime; Owner: supabase_realtime_admin
--

GRANT ALL ON TABLE realtime.messages TO postgres;
GRANT ALL ON TABLE realtime.messages TO dashboard_user;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO anon;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO authenticated;
GRANT SELECT,INSERT,UPDATE ON TABLE realtime.messages TO service_role;


--
-- Name: TABLE messages_2025_11_03; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_11_03 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_11_03 TO dashboard_user;


--
-- Name: TABLE messages_2025_11_04; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_11_04 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_11_04 TO dashboard_user;


--
-- Name: TABLE messages_2025_11_05; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_11_05 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_11_05 TO dashboard_user;


--
-- Name: TABLE messages_2025_11_06; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_11_06 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_11_06 TO dashboard_user;


--
-- Name: TABLE messages_2025_11_07; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.messages_2025_11_07 TO postgres;
GRANT ALL ON TABLE realtime.messages_2025_11_07 TO dashboard_user;


--
-- Name: TABLE schema_migrations; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.schema_migrations TO postgres;
GRANT ALL ON TABLE realtime.schema_migrations TO dashboard_user;
GRANT SELECT ON TABLE realtime.schema_migrations TO anon;
GRANT SELECT ON TABLE realtime.schema_migrations TO authenticated;
GRANT SELECT ON TABLE realtime.schema_migrations TO service_role;
GRANT ALL ON TABLE realtime.schema_migrations TO supabase_realtime_admin;


--
-- Name: TABLE subscription; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON TABLE realtime.subscription TO postgres;
GRANT ALL ON TABLE realtime.subscription TO dashboard_user;
GRANT SELECT ON TABLE realtime.subscription TO anon;
GRANT SELECT ON TABLE realtime.subscription TO authenticated;
GRANT SELECT ON TABLE realtime.subscription TO service_role;
GRANT ALL ON TABLE realtime.subscription TO supabase_realtime_admin;


--
-- Name: SEQUENCE subscription_id_seq; Type: ACL; Schema: realtime; Owner: supabase_admin
--

GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO postgres;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO dashboard_user;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO anon;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO authenticated;
GRANT USAGE ON SEQUENCE realtime.subscription_id_seq TO service_role;
GRANT ALL ON SEQUENCE realtime.subscription_id_seq TO supabase_realtime_admin;


--
-- Name: TABLE buckets; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.buckets TO anon;
GRANT ALL ON TABLE storage.buckets TO authenticated;
GRANT ALL ON TABLE storage.buckets TO service_role;
GRANT ALL ON TABLE storage.buckets TO postgres;


--
-- Name: TABLE migrations; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.migrations TO anon;
GRANT ALL ON TABLE storage.migrations TO authenticated;
GRANT ALL ON TABLE storage.migrations TO service_role;
GRANT ALL ON TABLE storage.migrations TO postgres;


--
-- Name: TABLE objects; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.objects TO anon;
GRANT ALL ON TABLE storage.objects TO authenticated;
GRANT ALL ON TABLE storage.objects TO service_role;
GRANT ALL ON TABLE storage.objects TO postgres;


--
-- Name: TABLE s3_multipart_uploads; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads TO anon;


--
-- Name: TABLE s3_multipart_uploads_parts; Type: ACL; Schema: storage; Owner: supabase_storage_admin
--

GRANT ALL ON TABLE storage.s3_multipart_uploads_parts TO service_role;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO authenticated;
GRANT SELECT ON TABLE storage.s3_multipart_uploads_parts TO anon;


--
-- Name: TABLE hooks; Type: ACL; Schema: supabase_functions; Owner: supabase_functions_admin
--

GRANT ALL ON TABLE supabase_functions.hooks TO postgres;
GRANT ALL ON TABLE supabase_functions.hooks TO anon;
GRANT ALL ON TABLE supabase_functions.hooks TO authenticated;
GRANT ALL ON TABLE supabase_functions.hooks TO service_role;


--
-- Name: SEQUENCE hooks_id_seq; Type: ACL; Schema: supabase_functions; Owner: supabase_functions_admin
--

GRANT ALL ON SEQUENCE supabase_functions.hooks_id_seq TO postgres;
GRANT ALL ON SEQUENCE supabase_functions.hooks_id_seq TO anon;
GRANT ALL ON SEQUENCE supabase_functions.hooks_id_seq TO authenticated;
GRANT ALL ON SEQUENCE supabase_functions.hooks_id_seq TO service_role;


--
-- Name: TABLE migrations; Type: ACL; Schema: supabase_functions; Owner: supabase_functions_admin
--

GRANT ALL ON TABLE supabase_functions.migrations TO postgres;
GRANT ALL ON TABLE supabase_functions.migrations TO anon;
GRANT ALL ON TABLE supabase_functions.migrations TO authenticated;
GRANT ALL ON TABLE supabase_functions.migrations TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON SEQUENCES  TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON FUNCTIONS  TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: auth; Owner: supabase_auth_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_auth_admin IN SCHEMA auth GRANT ALL ON TABLES  TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON SEQUENCES  TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON FUNCTIONS  TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: extensions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA extensions GRANT ALL ON TABLES  TO postgres WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON SEQUENCES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON FUNCTIONS  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql GRANT ALL ON TABLES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON SEQUENCES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON FUNCTIONS  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: graphql_public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA graphql_public GRANT ALL ON TABLES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: pgsodium; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA pgsodium GRANT ALL ON SEQUENCES  TO pgsodium_keyholder;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: pgsodium; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA pgsodium GRANT ALL ON TABLES  TO pgsodium_keyholder;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: pgsodium_masks; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA pgsodium_masks GRANT ALL ON SEQUENCES  TO pgsodium_keyiduser;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: pgsodium_masks; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA pgsodium_masks GRANT ALL ON FUNCTIONS  TO pgsodium_keyiduser;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: pgsodium_masks; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA pgsodium_masks GRANT ALL ON TABLES  TO pgsodium_keyiduser;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON SEQUENCES  TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON FUNCTIONS  TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: realtime; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA realtime GRANT ALL ON TABLES  TO dashboard_user;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON SEQUENCES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON FUNCTIONS  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: storage; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA storage GRANT ALL ON TABLES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: supabase_functions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON SEQUENCES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON SEQUENCES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON SEQUENCES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON SEQUENCES  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: supabase_functions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON FUNCTIONS  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON FUNCTIONS  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON FUNCTIONS  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON FUNCTIONS  TO service_role;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: supabase_functions; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON TABLES  TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON TABLES  TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON TABLES  TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA supabase_functions GRANT ALL ON TABLES  TO service_role;


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


ALTER EVENT TRIGGER issue_graphql_placeholder OWNER TO supabase_admin;

--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


ALTER EVENT TRIGGER issue_pg_cron_access OWNER TO supabase_admin;

--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


ALTER EVENT TRIGGER issue_pg_graphql_access OWNER TO supabase_admin;

--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: postgres
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


ALTER EVENT TRIGGER issue_pg_net_access OWNER TO postgres;

--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


ALTER EVENT TRIGGER pgrst_ddl_watch OWNER TO supabase_admin;

--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: supabase_admin
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


ALTER EVENT TRIGGER pgrst_drop_watch OWNER TO supabase_admin;

--
-- PostgreSQL database dump complete
--

