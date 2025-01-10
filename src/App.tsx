import { useState, useEffect, useCallback } from "react";
import initSqlJs from "sql.js";
import { Database } from "sql.js";
import { DatabaseIcon, Table2, Terminal } from "lucide-react";

interface TableData {
  columns: string[];
  values: any[][];
}

function App() {
  const [db, setDb] = useState<Database | null>(null);
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [queryResult, setQueryResult] = useState<TableData | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    // Initialize SQL.js
    initSqlJs({
      locateFile: (file) => `https://sql.js.org/dist/${file}`,
    }).catch((err) => {
      setError("Failed to load SQL.js: " + err.message);
    });
  }, []);

  const loadDatabase = useCallback(async (file: File) => {
    try {
      const SQL = await initSqlJs({
        locateFile: (file) => `https://sql.js.org/dist/${file}`,
      });

      const reader = new FileReader();
      reader.onload = function (e) {
        try {
          const Uints = new Uint8Array(e.target?.result as ArrayBuffer);
          const db = new SQL.Database(Uints);
          setDb(db);

          // Get all table names
          const tables = db.exec(
            "SELECT name FROM sqlite_master WHERE type='table'"
          )[0];
          if (tables && tables.values) {
            setTables(tables.values.map((v) => v[0] as string));
          }
          setError("");
        } catch (err) {
          setError("Error loading database: " + (err as Error).message);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      setError("Error initializing SQL.js: " + (err as Error).message);
    }
  }, []);

  const loadTableData = useCallback(
    (tableName: string) => {
      if (!db) return;
      try {
        setQuery(`SELECT * FROM ${tableName}`);
      } catch (err) {
        setError("Error loading table data: " + (err as Error).message);
      }
    },
    [db]
  );

  const executeQuery = useCallback(() => {
    if (!db || !query.trim()) return;
    try {
      const result = db.exec(query)[0];
      if (result) {
        setQueryResult({
          columns: result.columns,
          values: result.values,
        });
        setError("");
      } else {
        setQueryResult(null);
        setError("Query executed successfully but returned no results");
      }
    } catch (err) {
      setError("Error executing query: " + (err as Error).message);
    }
  }, [db, query]);

  const saveDb = async () => {
    if (db) {
      const data = db.export();
      const filePath = await window.ipcRenderer.invoke("save-file-dialog");
      if (filePath) {
        await window.ipcRenderer.invoke("write-file", filePath, data.buffer);
      }
    }
  };

  const handleTableSelect = (tableName: string) => {
    setSelectedTable(tableName);
    loadTableData(tableName);
  };

  const DataTable = ({ data }: { data: TableData }) => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            {data.columns.map((column, i) => (
              <th key={i} className="px-4 py-2 border-b text-left">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.values.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2 border-b">
                  {String(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <DatabaseIcon className="w-6 h-6 text-blue-500" />
            <h1 className="text-2xl font-bold">SQLite Database Viewer</h1>
          </div>

          <input
            type="file"
            accept=".db,.sqlite,.sqlite3"
            onChange={(e) =>
              e.target.files?.[0] && loadDatabase(e.target.files[0])
            }
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {db && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-2 mb-4">
              <Table2 className="w-6 h-6 text-green-500" />
              <h2 className="text-xl font-semibold">Tables</h2>
            </div>

            <select
              value={selectedTable}
              onChange={(e) => handleTableSelect(e.target.value)}
              className="w-full p-2 border rounded-md mb-4"
            >
              <option value="">Select a table</option>
              {tables.map((table) => (
                <option key={table} value={table}>
                  {table}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-2 mb-4">
              <Terminal className="w-6 h-6 text-purple-500" />
              <h2 className="text-xl font-semibold">SQL Query</h2>
            </div>

            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your SQL query here..."
              className="w-full p-2 border rounded-md mb-4 font-mono"
              rows={4}
            />

            <div className="flex justify-between">
              <button
                onClick={executeQuery}
                className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition-colors"
              >
                Execute Query
              </button>

              <button
                onClick={saveDb}
                className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition-colors"
              >
                Save DB
              </button>
            </div>
            {queryResult && (
              <div className="mt-4">
                <DataTable data={queryResult} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
