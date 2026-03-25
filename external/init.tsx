> => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    localStorage.setItem("systemInitialized", "true");
    localStorage.setItem("adminEmail", data.email);
    return { success: true, message: "Super Admin created successfully" };
  },
};

// Password strength validator
function getPasswordStrength(password: string): { strength: number; label: string; color: string } {
  let strength = 0;
  
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;

  const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  const colors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"];

  return {
    strength,
    label: labels[strength] || labels[0],
    color: colors[strength] || colors[0],
  };
}

// Readiness Check Component
function ReadinessCheck({ 
  onReady 
}: { 
  onReady: (readiness: SystemReadiness) => void 
}) {
  const [loading, setLoading] = useState(true);
  const [readiness, setReadiness] = useState<SystemReadiness | null>(null);

  useEffect(() => {
    checkSystemReadiness();
  }, []);

  const checkSystemReadiness = async () => {
    setLoading(true);
    try {
      const result = await mockApi.checkReadiness();
      setReadiness(result);
      onReady(result);
    } catch (error) {
      console.error("Failed to check readiness", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="p-8 max-w-md w-full text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-600 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Checking System Status
          </h2>
          <p className="text-sm text-gray-600">
            Please wait while we verify the system readiness...
          </p>
        </Card>
      </div>
    );
  }

  if (!readiness) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="p-8 max-w-2xl w-full">
        <div className="text-center mb-6">
          <Shield className="w-16 h-16 mx-auto text-blue-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            System Readiness Check
          </h1>
          <p className="text-gray-600">{readiness.message}</p>
        </div>

        <div className="space-y-4 mb-6">
          <StatusItem
            label="Database Schema"
            status={readiness.schemaExists}
            description="Database tables and structure"
          />
          <StatusItem
            label="System Initialized"
            status={readiness.systemInitialized}
            description="Super admin and core setup"
          />
          <StatusItem
            label="Ready for Initialization"
            status={readiness.readyForInitialization}
            description="Can create super admin"
          />
          <StatusItem
            label="Ready for Complete Setup"
            status={readiness.readyForCompleteSetup}
            description="Needs full system setup"
          />
        </div>

        <div className="flex gap-3">
          <Button
            onClick={checkSystemReadiness}
            variant="outline"
            className="flex-1"
          >
            Refresh Status
          </Button>
        </div>
      </Card>
    </div>
  );
}

function StatusItem({ 
  label, 
  status, 
  description 
}: { 
  label: string; 
  status: boolean; 
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
      {status ? (
        <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
      ) : (
        <XCircle className="w-5 h-5 text-gray-400 mt-0.5" />
      )}
      <div className="flex-1">
        <div className="font-medium text-gray-900">{label}</div>
        <div className="text-sm text-gray-600">{description}</div>
      </div>
      <Badge variant={status ? "default" : "secondary"}>
        {status ? "Ready" : "Pending"}
      </Badge>
    </div>
  );
}

// Complete Setup Wizard
function CompleteSetupWizard({ onComplete }: { onComplete: () => void }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [migrationStatus, setMigrationStatus] = useState<"idle" | "running" | "success" | "error">("idle");
  const [migrationMessage, setMigrationMessage] = useState("");

  const runMigrations = async () => {
    setMigrationStatus("running");
    setMigrationMessage("Running database migrations...");
    
    try {
      const result = await mockApi.runMigrations();
      if (result.success) {
        setMigrationStatus("success");
        setMigrationMessage(result.message);
        setTimeout(() => setCurrentStep(2), 1500);
      } else {
        setMigrationStatus("error");
        setMigrationMessage(result.message);
      }
    } catch (error) {
      setMigrationStatus("error");
      setMigrationMessage("Failed to run migrations. Please try again.");
    }
  };

  const handleAdminCreated = async (data: AdminFormData) => {
    try {
      const result = await mockApi.initializeComplete(data);
      if (result.success) {
        onComplete();
      }
    } catch (error) {
      console.error("Failed to initialize system", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="p-8 max-w-2xl w-full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete System Setup
          </h1>
          <p className="text-gray-600">
            Follow these steps to initialize your system
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-8">
          <div className={`flex-1 h-2 rounded-full ${currentStep >= 1 ? "bg-blue-600" : "bg-gray-200"}`} />
          <div className={`flex-1 h-2 rounded-full ${currentStep >= 2 ? "bg-blue-600" : "bg-gray-200"}`} />
        </div>

        {currentStep === 1 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Database className="w-8 h-8 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Step 1: Database Schema Setup
                </h2>
                <p className="text-sm text-gray-600">
                  Initialize the database structure
                </p>
              </div>
            </div>

            {migrationStatus === "idle" && (
              <div className="space-y-4">
                <Alert>
                  <Database className="w-4 h-4" />
                  <AlertDescription>
                    This will create all necessary database tables and structures.
                    The process may take a few moments.
                  </AlertDescription>
                </Alert>
                <Button 
                  onClick={runMigrations} 
                  className="w-full"
                  size="lg"
                >
                  Run Database Migrations
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {migrationStatus === "running" && (
              <div className="text-center py-8">
                <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-600 mb-4" />
                <p className="text-gray-600">{migrationMessage}</p>
              </div>
            )}

            {migrationStatus === "success" && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <AlertDescription className="text-green-900">
                  {migrationMessage}
                </AlertDescription>
              </Alert>
            )}

            {migrationStatus === "error" && (
              <div className="space-y-4">
                <Alert className="border-red-200 bg-red-50">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <AlertDescription className="text-red-900">
                    {migrationMessage}
                  </AlertDescription>
                </Alert>
                <Button 
                  onClick={runMigrations} 
                  variant="outline"
                  className="w-full"
                >
                  Retry Migration
                </Button>
              </div>
            )}
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <UserPlus className="w-8 h-8 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Step 2: Create Super Admin
                </h2>
                <p className="text-sm text-gray-600">
                  Set up your administrator account
                </p>
              </div>
            </div>
            <AdminForm onSubmit={handleAdminCreated} />
          </div>
        )}
      </Card>
    </div>
  );
}

// Initialize Admin Only (when schema exists)
function InitializeAdmin({ onComplete }: { onComplete: () => void }) {
  const handleAdminCreated = async (data: AdminFormData) => {
    try {
      const result = await mockApi.initializeAdmin(data);
      if (result.success) {
        onComplete();
      }
    } catch (error) {
      console.error("Failed to create admin", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="p-8 max-w-2xl w-full">
        <div className="text-center mb-6">
          <UserPlus className="w-16 h-16 mx-auto text-blue-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Super Admin
          </h1>
          <p className="text-gray-600">
            Initialize your system by creating the administrator account
          </p>
        </div>
        <AdminForm onSubmit={handleAdminCreated} />
      </Card>
    </div>
  );
}

// Admin Form Component
function AdminForm({ onSubmit }: { onSubmit: (data: AdminFormData) => void }) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AdminFormData>();

  const password = watch("password", "");
  const passwordStrength = password ? getPasswordStrength(password) : null;

  const onFormSubmit = async (data: AdminFormData) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          type="email"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: "Invalid email address",
            },
          })}
          className={errors.email ? "border-red-500" : ""}
        />
        {errors.email && (
          <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="fullName">Full Name *</Label>
        <Input
          id="fullName"
          {...register("fullName", {
            required: "Full name is required",
            minLength: {
              value: 2,
              message: "Name must be at least 2 characters",
            },
          })}
          className={errors.fullName ? "border-red-500" : ""}
        />
        {errors.fullName && (
          <p className="text-sm text-red-600 mt-1">{errors.fullName.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="phone">Phone Number (Optional)</Label>
        <Input
          id="phone"
          type="tel"
          {...register("phone")}
        />
      </div>

      <div>
        <Label htmlFor="password">Password *</Label>
        <Input
          id="password"
          type="password"
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters",
            },
            validate: (value) => {
              const hasUpperCase = /[A-Z]/.test(value);
              const hasLowerCase = /[a-z]/.test(value);
              const hasNumber = /\d/.test(value);
              
              if (!hasUpperCase || !hasLowerCase || !hasNumber) {
                return "Password must contain uppercase, lowercase, and number";
              }
              return true;
            },
          })}
          className={errors.password ? "border-red-500" : ""}
        />
        {passwordStrength && (
          <div className="mt-2">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${passwordStrength.color} transition-all`}
                  style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-600">{passwordStrength.label}</span>
            </div>
          </div>
        )}
        {errors.password && (
          <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
        )}
        <p className="text-xs text-gray-600 mt-1">
          At least 8 characters with uppercase, lowercase, and number
        </p>
      </div>

      <div>
        <Label htmlFor="confirmPassword">Confirm Password *</Label>
        <Input
          id="confirmPassword"
          type="password"
          {...register("confirmPassword", {
            required: "Please confirm your password",
            validate: (value) =>
              value === password || "Passwords do not match",
          })}
          className={errors.confirmPassword ? "border-red-500" : ""}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-red-600 mt-1">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Creating Account...
          </>
        ) : (
          <>
            Create Super Admin Account
            <ArrowRight className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>
    </form>
  );
}

// Success Dashboard
function SuccessDashboard() {
  const adminEmail = localStorage.getItem("adminEmail") || "admin@example.com";

  const handleReset = () => {
    localStorage.removeItem("systemInitialized");
    localStorage.removeItem("schemaExists");
    localStorage.removeItem("adminEmail");
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <Card className="p-8 max-w-2xl w-full">
        <div className="text-center mb-6">
          <CheckCircle2 className="w-20 h-20 mx-auto text-green-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            System Initialized Successfully!
          </h1>
          <p className="text-gray-600">
            Your system is now ready to use
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <div className="font-semibold text-blue-900 mb-1">
                  Super Admin Account Created
                </div>
                <div className="text-sm text-blue-700">
                  Email: <span className="font-mono">{adminEmail}</span>
                </div>
              </div>
            </div>
          </Card>

          <Alert>
            <Database className="w-4 h-4" />
            <AlertDescription>
              Database schema has been created and the system is ready for use.
              You can now log in with your super admin credentials.
            </AlertDescription>
          </Alert>
        </div>

        <div className="space-y-3">
          <Button className="w-full" size="lg">
            Go to Login
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleReset}
          >
            Reset System (Demo Only)
          </Button>
        </div>
      </Card>
    </div>
  );
}

// Main System Initialization Component
export default function SystemInitialization() {
  const [systemState, setSystemState] = useState<"checking" | "complete-setup" | "admin-only" | "completed">("checking");
  const [readiness, setReadiness] = useState<SystemReadiness | null>(null);

  const handleReadinessCheck = (result: SystemReadiness) => {
    setReadiness(result);
    
    if (result.systemInitialized) {
      setSystemState("completed");
    } else if (result.readyForCompleteSetup) {
      setSystemState("complete-setup");
    } else if (result.readyForInitialization) {
      setSystemState("admin-only");
    }
  };

  const handleSetupComplete = () => {
    setSystemState("completed");
  };

  if (systemState === "checking") {
    return <ReadinessCheck onReady={handleReadinessCheck} />;
  }

  if (systemState === "complete-setup") {
    return <CompleteSetupWizard onComplete={handleSetupComplete} />;
  }

  if (systemState === "admin-only") {
    return <InitializeAdmin onComplete={handleSetupComplete} />;
  }

  if (systemState === "completed") {
    return <SuccessDashboard />;
  }

  return null;
}
