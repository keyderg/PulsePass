package com.example.taller_persisntencia2;

import org.springframework.boot.SpringApplication;

public class TestTallerPersisntencia2Application {

    public static void main(String[] args) {
        SpringApplication.from(TallerPersisntencia2Application::main).with(TestcontainersConfiguration.class).run(args);
    }

}
