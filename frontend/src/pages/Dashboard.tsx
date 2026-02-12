function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              🧪 Qaptain Dashboard
            </h1>
            <button className="btn btn-secondary">Logout</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <h3 className="text-sm font-medium text-gray-500">Total Apps</h3>
            <p className="text-3xl font-bold mt-2">0</p>
          </div>
          
          <div className="card">
            <h3 className="text-sm font-medium text-gray-500">Active Runs</h3>
            <p className="text-3xl font-bold mt-2">0</p>
          </div>
          
          <div className="card">
            <h3 className="text-sm font-medium text-gray-500">Pass Rate</h3>
            <p className="text-3xl font-bold mt-2 text-green-600">0%</p>
          </div>
          
          <div className="card">
            <h3 className="text-sm font-medium text-gray-500">Total Tests</h3>
            <p className="text-3xl font-bold mt-2">0</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card mb-8">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="flex gap-4">
            <button className="btn btn-primary">➕ Add New App</button>
            <button className="btn btn-secondary">▶️ Run Tests</button>
            <button className="btn btn-secondary">📊 View Reports</button>
          </div>
        </div>

        {/* Recent Runs */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Recent Test Runs</h2>
          <div className="text-center text-gray-500 py-8">
            No test runs yet. Create an app and run your first test!
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
