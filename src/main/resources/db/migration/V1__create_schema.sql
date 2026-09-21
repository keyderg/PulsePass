CREATE TABLE venues (
                        id BIGSERIAL PRIMARY KEY,
                        code VARCHAR(50) UNIQUE NOT NULL,
                        name VARCHAR(255) NOT NULL,
                        city VARCHAR(100) NOT NULL,
                        address VARCHAR(255) NOT NULL,
                        capacity INT NOT NULL CHECK (capacity > 0),
                        active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE events (
                        id BIGSERIAL PRIMARY KEY,
                        event_code VARCHAR(50) UNIQUE NOT NULL,
                        name VARCHAR(255) NOT NULL,
                        description TEXT,
                        category VARCHAR(50) NOT NULL,
                        status VARCHAR(50) NOT NULL,
                        event_date TIMESTAMP NOT NULL,
                        minimum_age INT NOT NULL DEFAULT 0,
                        venue_id BIGINT NOT NULL,
                        CONSTRAINT fk_events_venue FOREIGN KEY (venue_id) REFERENCES venues(id)
);

CREATE TABLE artists (
                         id BIGSERIAL PRIMARY KEY,
                         stage_name VARCHAR(100) UNIQUE NOT NULL,
                         country VARCHAR(100) NOT NULL,
                         genre VARCHAR(100) NOT NULL,
                         active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE event_artists (
                               event_id BIGINT NOT NULL,
                               artist_id BIGINT NOT NULL,
                               PRIMARY KEY (event_id, artist_id),
                               CONSTRAINT fk_ea_event FOREIGN KEY (event_id) REFERENCES events(id),
                               CONSTRAINT fk_ea_artist FOREIGN KEY (artist_id) REFERENCES artists(id)
);

CREATE TABLE users (
                       id BIGSERIAL PRIMARY KEY,
                       username VARCHAR(100) UNIQUE NOT NULL,
                       email VARCHAR(255) UNIQUE NOT NULL,
                       active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE user_profiles (
                               id BIGSERIAL PRIMARY KEY,
                               first_name VARCHAR(100) NOT NULL,
                               last_name VARCHAR(100) NOT NULL,
                               phone VARCHAR(50),
                               city VARCHAR(100),
                               birth_date DATE NOT NULL,
                               user_id BIGINT UNIQUE NOT NULL,
                               CONSTRAINT fk_profile_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE tickets (
                         id BIGSERIAL PRIMARY KEY,
                         ticket_code VARCHAR(50) UNIQUE NOT NULL,
                         type VARCHAR(50) NOT NULL,
                         price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
                         status VARCHAR(50) NOT NULL,
                         purchase_date TIMESTAMP NOT NULL,
                         user_id BIGINT NOT NULL,
                         event_id BIGINT NOT NULL,
                         CONSTRAINT fk_tickets_user FOREIGN KEY (user_id) REFERENCES users(id),
                         CONSTRAINT fk_tickets_event FOREIGN KEY (event_id) REFERENCES events(id)
);