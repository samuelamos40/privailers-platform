# Power BI Data Pipeline Integration Guide

As a data consultancy, you can use Power BI to directly query your platform's raw data for custom dashboards and advanced analytics. We have set up a secure API endpoint to facilitate this.

## Pipeline Details
- **Endpoint URL**: `http://localhost:3000/api/analytics/pipeline` (Update this to your production URL when deployed to Vercel, e.g., `https://your-app.vercel.app/api/analytics/pipeline`)
- **Authentication Key**: `x-pipeline-key: privailers_data_secret_2026`

## How to Connect Power BI

1. Open **Power BI Desktop**.
2. Go to **Get Data** > **Web**.
3. Select the **Advanced** option (instead of Basic).
4. Fill in the following:
   - **URL parts**: Enter your Endpoint URL (e.g., `http://localhost:3000/api/analytics/pipeline`).
   - **HTTP request header parameters (optional)**:
     - On the left side (key), type: `x-pipeline-key`
     - On the right side (value), type your secret key: `privailers_data_secret_2026`
5. Click **OK**.
6. When the "Access Web content" dialog appears, leave it on **Anonymous** (the authentication is handled by the header we just added) and click **Connect**.

### Data Transformation steps in Power Query

Power BI will load the data as a JSON object. You'll need to expand it:
1. In the Power Query Editor, you'll see a Record showing `metadata` and `data`.
2. Click on the `Record` link next to **data**.
3. You will now see your tables: `users`, `leads`, `courses`, `enrollments`, `projects`.
4. Click on the `List` link next to the table you want to import (e.g., `enrollments`).
5. Click **To Table** in the top left corner.
6. Click the small expansion arrows icon at the top of the new column to expand the JSON properties into individual columns.
7. Click **Close & Apply**.

> **Note:** To query multiple tables, you can right-click the initial GET request step in Power Query, duplicate it, and expand a different table for each query.

## Important Note on Security and Completeness
To ensure Power BI can access all data (bypassing Supabase Row Level Security restrictions for anonymous requests), make sure you have added your **Supabase Service Role Key** to the `.env.local` file:
```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```
You can find this key in your Supabase Dashboard under Settings > API > `service_role secret`. Do **not** expose this key to the frontend!
