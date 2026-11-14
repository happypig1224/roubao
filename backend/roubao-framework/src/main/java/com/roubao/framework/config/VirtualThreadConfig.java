package com.roubao.framework.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

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
        return Executors.newVirtualThreadPerTaskExecutor();
    }
}
