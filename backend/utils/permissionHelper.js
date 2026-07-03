const pool = require("../db");

const hasPermission = async (userId, role, menuName) => {

    if (role === "master") {
        return true;
    }

    const result = await pool.query(
        `
        SELECT 1
        FROM admin_permissions ap
        JOIN menu_master mm
            ON ap.menu_id = mm.menu_id
        WHERE ap.user_id = $1
        AND mm.menu_name = $2
        `,
        [userId, menuName]
    );

    return result.rows.length > 0;
};

module.exports = hasPermission;