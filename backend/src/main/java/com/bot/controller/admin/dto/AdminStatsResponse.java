package com.bot.controller.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO trả về thống kê tổng quan cho Admin Dashboard.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsResponse {

    private long totalUsers;
    private long activeUsers;
    private long inactiveUsers;
    private long adminUsers;
}
