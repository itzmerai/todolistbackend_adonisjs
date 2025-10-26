
CREATE TABLE IF NOT EXISTS public.users
(
    "userId" bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    username text COLLATE pg_catalog."default",
    userpassword text COLLATE pg_catalog."default",
    CONSTRAINT users_pkey PRIMARY KEY ("userId")
);

CREATE TABLE IF NOT EXISTS public.tasks
(
    "taskId" bigint NOT NULL GENERATED ALWAYS AS IDENTITY ( INCREMENT 1 START 1 MINVALUE 1 MAXVALUE 9223372036854775807 CACHE 1 ),
    taskname text COLLATE pg_catalog."default",
    taskdescription text COLLATE pg_catalog."default",
    "userID" integer,
    CONSTRAINT tasks_pkey PRIMARY KEY ("taskId")
);

ALTER TABLE IF EXISTS public.tasks
    ADD CONSTRAINT fk_tasks_user FOREIGN KEY ("userID")
    REFERENCES public.users ("userId") MATCH SIMPLE
    ON UPDATE NO ACTION
    ON DELETE CASCADE;

