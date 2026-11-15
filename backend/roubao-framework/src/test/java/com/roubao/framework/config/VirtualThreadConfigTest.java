package com.roubao.framework.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.slf4j.MDC;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executor;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 虚拟线程执行器与 MDC 上下文传递单元测试
 *
 * @author roubao
 * @since 2026-11-15
 */
class VirtualThreadConfigTest {

    private final VirtualThreadConfig config = new VirtualThreadConfig();

    @Test
    @DisplayName("虚拟线程执行器必须正确复制并透传父线程的 MDC traceId 上下文")
    void shouldPropagateMdcContextToVirtualThread() throws InterruptedException {
        Executor executor = config.virtualThreadExecutor();
        CountDownLatch latch = new CountDownLatch(1);
        AtomicReference<String> capturedTraceId = new AtomicReference<>();
        AtomicReference<Boolean> isVirtualThread = new AtomicReference<>();

        MDC.put("traceId", "test-trace-99999");
        try {
            executor.execute(() -> {
                try {
                    capturedTraceId.set(MDC.get("traceId"));
                    isVirtualThread.set(Thread.currentThread().isVirtual());
                } finally {
                    latch.countDown();
                }
            });

            boolean completed = latch.await(3, TimeUnit.SECONDS);
            assertThat(completed).isTrue();
            assertThat(capturedTraceId.get()).isEqualTo("test-trace-99999");
            assertThat(isVirtualThread.get()).isTrue();
        } finally {
            MDC.clear();
        }
    }
}
