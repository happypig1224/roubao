---
name: db-migration-manager
description: >-
  数据库无损迁移与版本化脚本管理技能。
  基于 Flyway/Liquibase 最佳实践，严格拦截暴力 ALTER/DROP 语句，
  强制执行扩缩容三步走策略，保障生产环境 Zero-Downtime 数据库安全变更。
---

# DB Migration Manager Skill (数据库无损迁移管理)

> **定位**：封印大模型直接操作物理表（如直接运行 `ALTER TABLE`）的破坏性能力，将所有结构变更强制转化为版本化、向后兼容的迁移脚本。
> **核心原则**：生产环境零宕机（Zero-Downtime）。只允许“扩充式变更”，重命名或删除列必须遵守“双写、迁移读、删旧”三步曲。

---

## 1. 触发时机 (Trigger Condition)

当出现以下情况时，激活并执行本 Skill：
1. 需要修改实体结构、增加字段、调整字段类型或建立新索引时；
2. 发现性能瓶颈需要优化数据库 DDL 时；
3. 构建或演进业务线涉及数据表新增与关系变动时。

---

## 2. 核心红线守则 (Guards & Hard Boundaries)

- [ ] **严禁直接修改数据库**：AI 决不能直接连接开发/生产库执行 `ALTER`、`DROP`、`CREATE`。所有的变更必须落地为 SQL 文件（如 `V1.2__add_avatar_url_to_users.sql`）。
- [ ] **严禁执行 DROP 和重命名 (RENAME)**：禁止在当前版本直接删除列或重命名列，这会导致老版本代码立刻报错（破坏向后兼容）。
- [ ] **强制向后兼容 (Backward Compatibility)**：新增非空列必须设置默认值（`DEFAULT`），避免插入老数据失败。

---

## 3. 数据库变更工作流 (Zero-Downtime Pipeline)

### 场景 A：新增字段（扩充式变更 - 安全）
**正确做法**：直接在 `src/main/resources/db/migration/` 目录下生成 `V{版本号}__{描述}.sql`，执行 `ALTER TABLE xxx ADD COLUMN yyy`。

### 场景 B：重命名/改变数据结构（破坏式变更 - 危险）
**正确做法（强制三步走）**：
1. **步骤一（当前版本 V1）**：新增新列（如 `avatar_url_v2`）。修改业务代码，让写入时**双写**（写老列和新列），读取时**读老列**。
2. **步骤二（下个版本 V2）**：编写数据迁移脚本，把老列的数据全部刷到新列。修改业务代码，读取时**切到读新列**。
3. **步骤三（未来版本 V3）**：在确认没问题后，提交清理脚本 `DROP COLUMN avatar_url_v1`。

---

## 4. 迁移脚本产出范例 (Migration Script Standard)

### 正确的脚本范例 (V1.0.1__add_last_login_at_to_users.sql)
```sql
-- 确保可重复执行或幂等性，不破坏老数据
ALTER TABLE users 
ADD COLUMN last_login_at TIMESTAMP NULL DEFAULT NULL COMMENT '最后登录时间';

CREATE INDEX idx_users_last_login ON users(last_login_at);
```

### 错误的脚本范例（严禁生成）
```sql
-- ❌ 严禁直接删除字段，会导致线上旧服务 Crash
ALTER TABLE users DROP COLUMN old_password;

-- ❌ 严禁直接修改字段类型（可能导致隐式数据截断丢失）
ALTER TABLE users MODIFY COLUMN age VARCHAR(10);
```

---

## 5. 验收清单 (Checklist before Handoff)

在完成迁移脚本生成后，务必确认：
1. 文件名是否严格符合规范（如 Flyway 的 `V{Version}__{Description}.sql`）？
2. 是否存在任何可能破坏当前线上老代码的语句（DROP, RENAME）？
3. 如果是高并发表的大规模建索引操作，是否使用了 `ALGORITHM=INPLACE, LOCK=NONE`（MySQL 在线 DDL）以防止锁表？
