package com.example.taller_persisntencia2.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.Test;
import org.slf4j.MDC;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class RequestIdFilterTest {

    private final RequestIdFilter filter = new RequestIdFilter();

    //el id va en el header y en el MDC durante el request, y el MDC queda limpio al terminar.
    @Test
    void setsHeaderAndExposesIdInMdcOnlyDuringTheRequest() throws Exception {
        MockHttpServletResponse response = new MockHttpServletResponse();
        AtomicReference<String> mdcDuringChain = new AtomicReference<>();
        FilterChain chain = (req, res) -> mdcDuringChain.set(MDC.get("requestId"));

        filter.doFilter(new MockHttpServletRequest(), response, chain);

        String header = response.getHeader("X-Request-Id");
        assertThat(UUID.fromString(header)).isNotNull();      // es un UUID válido
        assertThat(mdcDuringChain.get()).isEqualTo(header);   // el MDC tenía el mismo id
        assertThat(MDC.get("requestId")).isNull();            // se limpió al terminar
    }

    //un X-Request-Id enviado por el cliente se ignora. Es la protección contra log injection.
    @Test
    void ignoresRequestIdSentByTheClient() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("X-Request-Id", "id-falso-del-cliente");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, (req, res) -> { });

        assertThat(response.getHeader("X-Request-Id")).isNotEqualTo("id-falso-del-cliente");
    }

    //el MDC se limpia aunque la cadena falle (el finally del filtro).
    @Test
    void clearsMdcEvenWhenTheChainFails() {
        FilterChain failing = (req, res) -> { throw new ServletException("boom"); };

        assertThatThrownBy(() ->
                filter.doFilter(new MockHttpServletRequest(), new MockHttpServletResponse(), failing))
                .isInstanceOf(ServletException.class);

        assertThat(MDC.get("requestId")).isNull();
    }
}