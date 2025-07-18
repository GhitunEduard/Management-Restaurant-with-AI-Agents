package com.example.logs_service.config;

// NOU: Importuri necesare pentru convertorul JSON
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE_NAME = "logs_exchange";
    public static final String QUEUE_NAME = "logs_queue";
    @Bean
    DirectExchange exchange() {
        return new DirectExchange(EXCHANGE_NAME);
    }
    @Bean
    Queue queue() {
        return new Queue(QUEUE_NAME, true);
    }
    @Bean
    Binding productBinding(Queue queue, DirectExchange exchange) {
        return BindingBuilder.bind(queue).to(exchange).with("log.product.event");
    }

    @Bean
    Binding reservationBinding(Queue queue, DirectExchange exchange) {
        return BindingBuilder.bind(queue).to(exchange).with("log.reservation.event");
    }

    @Bean
    Binding categoryBinding(Queue queue, DirectExchange exchange) {
        return BindingBuilder.bind(queue).to(exchange).with("log.category.event");
    }

    @Bean
    Binding ingredientBinding(Queue queue, DirectExchange exchange) {
        return BindingBuilder.bind(queue).to(exchange).with("log.ingredient.event");
    }

    @Bean
    Binding orderBinding(Queue queue, DirectExchange exchange) {
        return BindingBuilder.bind(queue).to(exchange).with("log.order.event");
    }
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}