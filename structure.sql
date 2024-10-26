--
-- PostgreSQL database dump
--

-- Dumped from database version 14.13 (Homebrew)
-- Dumped by pg_dump version 14.13 (Homebrew)

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
-- Name: assign_user_to_project(integer, integer, character varying); Type: FUNCTION; Schema: public; Owner: jules
--

CREATE FUNCTION public.assign_user_to_project(p_user_id integer, p_project_id integer, p_role character varying DEFAULT 'member'::character varying) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO project_assignments (user_id, project_id, role)
    VALUES (p_user_id, p_project_id, p_role)
    ON CONFLICT (user_id, project_id) DO NOTHING;  -- Ignore si l'utilisateur est déjà assigné
END;
$$;


ALTER FUNCTION public.assign_user_to_project(p_user_id integer, p_project_id integer, p_role character varying) OWNER TO jules;

--
-- Name: create_default_boards(); Type: FUNCTION; Schema: public; Owner: jules
--

CREATE FUNCTION public.create_default_boards() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO boards (project_id, title) VALUES (NEW.id, 'To Do');
    INSERT INTO boards (project_id, title) VALUES (NEW.id, 'In Progress');
    INSERT INTO boards (project_id, title) VALUES (NEW.id, 'Completed');
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.create_default_boards() OWNER TO jules;

--
-- Name: update_board_timestamp(); Type: FUNCTION; Schema: public; Owner: jules
--

CREATE FUNCTION public.update_board_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;  -- Met à jour le champ updated_at à l'heure actuelle
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_board_timestamp() OWNER TO jules;

--
-- Name: update_task_timestamp(); Type: FUNCTION; Schema: public; Owner: jules
--

CREATE FUNCTION public.update_task_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;  -- Met à jour le champ updated_at à l'heure actuelle
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_task_timestamp() OWNER TO jules;

--
-- Name: update_timestamp(); Type: FUNCTION; Schema: public; Owner: jules
--

CREATE FUNCTION public.update_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;  -- Met à jour le champ updated_at à l'heure actuelle
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_timestamp() OWNER TO jules;

--
-- Name: update_updated_at(); Type: FUNCTION; Schema: public; Owner: jules
--

CREATE FUNCTION public.update_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at() OWNER TO jules;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: boards; Type: TABLE; Schema: public; Owner: jules
--

CREATE TABLE public.boards (
    id integer NOT NULL,
    project_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    title character varying(255)
);


ALTER TABLE public.boards OWNER TO jules;

--
-- Name: boards_id_seq; Type: SEQUENCE; Schema: public; Owner: jules
--

CREATE SEQUENCE public.boards_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.boards_id_seq OWNER TO jules;

--
-- Name: boards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jules
--

ALTER SEQUENCE public.boards_id_seq OWNED BY public.boards.id;


--
-- Name: project_assignments; Type: TABLE; Schema: public; Owner: jules
--

CREATE TABLE public.project_assignments (
    id integer NOT NULL,
    user_id integer NOT NULL,
    project_id integer NOT NULL,
    role character varying(20) DEFAULT 'viewer'::character varying,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.project_assignments OWNER TO jules;

--
-- Name: project_assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: jules
--

CREATE SEQUENCE public.project_assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.project_assignments_id_seq OWNER TO jules;

--
-- Name: project_assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jules
--

ALTER SEQUENCE public.project_assignments_id_seq OWNED BY public.project_assignments.id;


--
-- Name: projects; Type: TABLE; Schema: public; Owner: jules
--

CREATE TABLE public.projects (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    owner_id integer NOT NULL
);


ALTER TABLE public.projects OWNER TO jules;

--
-- Name: projects_id_seq; Type: SEQUENCE; Schema: public; Owner: jules
--

CREATE SEQUENCE public.projects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.projects_id_seq OWNER TO jules;

--
-- Name: projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jules
--

ALTER SEQUENCE public.projects_id_seq OWNED BY public.projects.id;


--
-- Name: tasks; Type: TABLE; Schema: public; Owner: jules
--

CREATE TABLE public.tasks (
    id integer NOT NULL,
    title character varying(100) NOT NULL,
    description text,
    status character varying(20) DEFAULT 'pending'::character varying,
    board_id integer NOT NULL,
    assigned_to integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.tasks OWNER TO jules;

--
-- Name: tasks_id_seq; Type: SEQUENCE; Schema: public; Owner: jules
--

CREATE SEQUENCE public.tasks_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tasks_id_seq OWNER TO jules;

--
-- Name: tasks_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jules
--

ALTER SEQUENCE public.tasks_id_seq OWNED BY public.tasks.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: jules
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.users OWNER TO jules;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: jules
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO jules;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: jules
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: boards id; Type: DEFAULT; Schema: public; Owner: jules
--

ALTER TABLE ONLY public.boards ALTER COLUMN id SET DEFAULT nextval('public.boards_id_seq'::regclass);


--
-- Name: project_assignments id; Type: DEFAULT; Schema: public; Owner: jules
--

ALTER TABLE ONLY public.project_assignments ALTER COLUMN id SET DEFAULT nextval('public.project_assignments_id_seq'::regclass);


--
-- Name: projects id; Type: DEFAULT; Schema: public; Owner: jules
--

ALTER TABLE ONLY public.projects ALTER COLUMN id SET DEFAULT nextval('public.projects_id_seq'::regclass);


--
-- Name: tasks id; Type: DEFAULT; Schema: public; Owner: jules
--

ALTER TABLE ONLY public.tasks ALTER COLUMN id SET DEFAULT nextval('public.tasks_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: jules
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: boards boards_pkey; Type: CONSTRAINT; Schema: public; Owner: jules
--

ALTER TABLE ONLY public.boards
    ADD CONSTRAINT boards_pkey PRIMARY KEY (id);


--
-- Name: project_assignments project_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: jules
--

ALTER TABLE ONLY public.project_assignments
    ADD CONSTRAINT project_assignments_pkey PRIMARY KEY (id);


--
-- Name: project_assignments project_assignments_user_id_project_id_key; Type: CONSTRAINT; Schema: public; Owner: jules
--

ALTER TABLE ONLY public.project_assignments
    ADD CONSTRAINT project_assignments_user_id_project_id_key UNIQUE (user_id, project_id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: jules
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: jules
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: jules
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: jules
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: jules
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: project_assignments set_updated_at; Type: TRIGGER; Schema: public; Owner: jules
--

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.project_assignments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


--
-- Name: projects trigger_create_default_boards; Type: TRIGGER; Schema: public; Owner: jules
--

CREATE TRIGGER trigger_create_default_boards AFTER INSERT ON public.projects FOR EACH ROW EXECUTE FUNCTION public.create_default_boards();


--
-- Name: boards trigger_update_board_timestamp; Type: TRIGGER; Schema: public; Owner: jules
--

CREATE TRIGGER trigger_update_board_timestamp BEFORE UPDATE ON public.boards FOR EACH ROW EXECUTE FUNCTION public.update_board_timestamp();


--
-- Name: tasks trigger_update_task_timestamp; Type: TRIGGER; Schema: public; Owner: jules
--

CREATE TRIGGER trigger_update_task_timestamp BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_task_timestamp();


--
-- Name: projects trigger_update_timestamp; Type: TRIGGER; Schema: public; Owner: jules
--

CREATE TRIGGER trigger_update_timestamp BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();


--
-- Name: boards boards_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jules
--

ALTER TABLE ONLY public.boards
    ADD CONSTRAINT boards_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: projects fk_owner; Type: FK CONSTRAINT; Schema: public; Owner: jules
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT fk_owner FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: project_assignments project_assignments_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jules
--

ALTER TABLE ONLY public.project_assignments
    ADD CONSTRAINT project_assignments_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_assignments project_assignments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jules
--

ALTER TABLE ONLY public.project_assignments
    ADD CONSTRAINT project_assignments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: tasks tasks_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jules
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: tasks tasks_board_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: jules
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_board_id_fkey FOREIGN KEY (board_id) REFERENCES public.boards(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

