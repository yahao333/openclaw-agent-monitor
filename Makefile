.PHONY: help test-agents test-upload test-upload-file

# Default target
help:
	@echo "Available targets:"
	@echo "  test-agents       - Send test JSON data to /api/agents (inline data)"
	@echo "  test-upload       - Send test JSON data to /api/upload endpoint"
	@echo "  test-upload-file  - Upload test.json file to /api/upload endpoint"
	@echo ""
	@echo "Usage:"
	@echo "  make test-agents TOKEN=your-token URL=http://localhost:3000"
	@echo "  make test-upload TOKEN=your-token URL=http://localhost:3000"
	@echo "  make test-upload-file TOKEN=your-token URL=http://localhost:3000"

# Test sending agents JSON data to /api/agents (using x-agent-token header)
test-agents:
	@if [ -z "$(TOKEN)" ]; then \
		echo "Error: TOKEN is required. Usage: make test-agents TOKEN=your-token URL=http://localhost:3000"; \
		exit 1; \
	fi
	@if [ -z "$(URL)" ]; then \
		echo "Error: URL is required. Usage: make test-agents TOKEN=your-token URL=http://localhost:3000"; \
		exit 1; \
	fi
	@echo "Sending test agents to $(URL)/api/agents..."
	@curl -X POST "$(URL)/api/agents" \
		-H "Content-Type: application/json" \
		-H "x-agent-token: $(TOKEN)" \
		-d '[{"id":"test-001","name":{"en":"Test Agent A","zh":"测试Agent 1"},"status":"online","lastActive":{"en":"Just now","zh":"刚刚"},"greeting":{"en":"Hello!","zh":"你好！"}},{"id":"test-002","name":{"en":"Test Agent 2","zh":"测试Agent 2"},"status":"offline","lastActive":{"en":"1 hour ago","zh":"1小时前"},"greeting":{"en":"Goodbye!","zh":"再见！"}}]' \
		-w "\nHTTP Status: %{http_code}\n"
	@echo ""
	@echo "Fetching agents from API..."
	@curl -X GET "$(URL)/api/agents" \
		-H "x-agent-token: $(TOKEN)" \
		-w "\nHTTP Status: %{http_code}\n"

# Test uploading agents JSON data to /api/upload endpoint (validates token against user settings)
test-upload:
	@if [ -z "$(TOKEN)" ]; then \
		echo "Error: TOKEN is required. Usage: make test-upload TOKEN=your-token URL=http://localhost:3000"; \
		exit 1; \
	fi
	@if [ -z "$(URL)" ]; then \
		echo "Error: URL is required. Usage: make test-upload TOKEN=your-token URL=http://localhost:3000"; \
		exit 1; \
	fi
	@echo "Uploading test agents to $(URL)/api/upload (token validation enabled)..."
	@curl -X POST "$(URL)/api/upload" \
		-H "Content-Type: application/json" \
		-H "x-agent-token: $(TOKEN)" \
		-d '[{"id":"test-001","name":{"en":"Test Agent 1","zh":"测试Agent 1"},"status":"online","lastActive":{"en":"Just now","zh":"刚刚"},"greeting":{"en":"Hello!","zh":"你好！"}},{"id":"test-002","name":{"en":"Test Agent 2","zh":"测试Agent 2"},"status":"offline","lastActive":{"en":"1 hour ago","zh":"1小时前"},"greeting":{"en":"Goodbye!","zh":"再见！"}}]' \
		-w "\nHTTP Status: %{http_code}\n"

# Upload test.json file to /api/upload endpoint
# Token must match a user's saved token in settings
test-upload-file:
	@if [ -z "$(TOKEN)" ]; then \
		echo "Error: TOKEN is required. Usage: make test-upload-file TOKEN=your-token URL=http://localhost:3000"; \
		exit 1; \
	fi
	@if [ -z "$(URL)" ]; then \
		echo "Error: URL is required. Usage: make test-upload-file TOKEN=your-token URL=http://localhost:3000"; \
		exit 1; \
	fi
	@if [ ! -f test.json ]; then \
		echo "Error: test.json not found in current directory"; \
		exit 1; \
	fi
	@echo "Uploading test.json to $(URL)/api/upload (token validation enabled)..."
	@curl -X POST "$(URL)/api/upload" \
		-H "Content-Type: application/json" \
		-H "x-agent-token: $(TOKEN)" \
		-d @test.json \
		-w "\nHTTP Status: %{http_code}\n"
