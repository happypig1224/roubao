package com.roubao.framework.config;

import org.slf4j.MDC;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Map;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;

/**
 * Java 21 虚拟线程全局执行器配置
 *
 * @author roubao
 * @since 2026-11-14
 */
@Configuration
public class VirtualThreadConfig {

    public static final String VIRTUAL_THREAD_EXECUTOR_BEAN = "virtualThreadExecutor";

    @Bean(name = VIRTUAL_THREAD_EXECUTOR_BEAN)
    @ConditionalOnMissingBean(name = VIRTUAL_THREAD_EXECUTOR_BEAN)
    public Executor virtualThreadExecutor() {
        Executor baseExecutor = Executors.newVirtualThreadPerTaskExecutor();
        return command -> {
            Map<String, String> contextMap = MDC.getCopyOfContextMap();
            baseExecutor.execute(() -> {
                if (contextMap != null) {
                    MDC.setContextMap(contextMap);
                }
                try {
                    command.run();
                } finally {
                    MDC.clear();
                }
            });
        };
    }
}
