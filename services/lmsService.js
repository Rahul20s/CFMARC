const axios = require('axios');

class LMSService {
    constructor() {
        this.baseURL = process.env.LMS_BASE_URL;
        this.token = null;
        this.tokenExpiry = null;
    }

    async authenticate() {
        try {
            const response = await axios.post(`${this.baseURL}/api/auth/login`, {
                username: process.env.LMS_USERNAME,
                password: process.env.LMS_PASSWORD,
                client_id: process.env.LMS_CLIENT_ID,
                client_secret: process.env.LMS_CLIENT_SECRET
            });

            this.token = response.data.access_token;
            this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
            
            console.log('LMS Authentication successful');
            return this.token;
        } catch (error) {
            console.error('LMS Authentication failed:', error.response?.data || error.message);
            throw new Error('Authentication failed with Credit Nirvana LMS');
        }
    }

    async getAuthHeaders() {
        if (!this.token || Date.now() >= this.tokenExpiry) {
            await this.authenticate();
        }
        
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
            'X-API-Key': process.env.LMS_API_KEY
        };
    }

    async searchCustomer(mobileNumber, loanAccount) {
        try {
            // Check if LMS is configured with real credentials
            if (!process.env.LMS_USERNAME || process.env.LMS_USERNAME === 'your_lms_username') {
                console.log('Using mock data for customer search (LMS not configured)');
                
                // Mock customer data for testing
                const mockCustomers = [
                    {
                        customer_id: 'CUST001',
                        customer_name: 'Rahul Sharma',
                        mobile_number: mobileNumber,
                        loan_account: loanAccount,
                        found: true,
                        loans: [
                            {
                                loan_id: 'LN001',
                                loan_account: loanAccount,
                                outstanding_amount: 45000,
                                due_date: '2025-03-25'
                            }
                        ]
                    }
                ];
                
                const customer = mockCustomers.find(cust => 
                    cust.mobile_number === mobileNumber && cust.loan_account === loanAccount
                );
                
                return customer || { found: false };
            }
            
            // Use real LMS API if credentials are configured
            const headers = await this.getAuthHeaders();
            const response = await axios.get(`${this.baseURL}/api/customers/search`, {
                params: { 
                    mobile_number: mobileNumber, 
                    loan_account: loanAccount 
                },
                headers
            });
            
            console.log(`Customer search successful for mobile: ${mobileNumber}`);
            return response.data;
        } catch (error) {
            console.error('Customer search failed:', error.response?.data || error.message);
            throw error;
        }
    }

    async getLoanOutstanding(loanId) {
        try {
            // Check if LMS is configured with real credentials
            if (!process.env.LMS_USERNAME || process.env.LMS_USERNAME === 'your_lms_username') {
                console.log('Using mock data for loan outstanding (LMS not configured)');
                
                return {
                    success: true,
                    data: {
                        outstanding: {
                            amount: 'Rs. 45,000',
                            dueDate: '2025-03-25',
                            totalDue: 'Rs. 47,500'
                        }
                    }
                };
            }
            
            // Use real LMS API if credentials are configured
            const headers = await this.getAuthHeaders();
            const response = await axios.get(`${this.baseURL}/api/loans/${loanId}/outstanding`, {
                headers
            });
            
            console.log(`Outstanding fetch successful for loan: ${loanId}`);
            return response.data;
        } catch (error) {
            console.error('Outstanding fetch failed:', error.response?.data || error.message);
            throw error;
        }
    }

    async getEMIStatus(loanId) {
        try {
            // Check if LMS is configured with real credentials
            if (!process.env.LMS_USERNAME || process.env.LMS_USERNAME === 'your_lms_username') {
                console.log('Using mock data for EMI status (LMS not configured)');
                
                return {
                    success: true,
                    data: {
                        totalEmis: 12,
                        paidEmis: 8,
                        pendingEmis: 4,
                        nextDueDate: '2025-04-05',
                        nextDueAmount: 5000
                    }
                };
            }
            
            // Use real LMS API if credentials are configured
            const headers = await this.getAuthHeaders();
            const response = await axios.get(`${this.baseURL}/api/loans/${loanId}/emi-status`, {
                headers
            });
            
            console.log(`EMI status fetch successful for loan: ${loanId}`);
            return response.data;
        } catch (error) {
            console.error('EMI status fetch failed:', error.response?.data || error.message);
            throw error;
        }
    }

    async getLoanStatement(loanId, fromDate, toDate) {
        try {
            const headers = await this.getAuthHeaders();
            const response = await axios.get(`${this.baseURL}/api/loans/${loanId}/statement`, {
                params: { 
                    from_date: fromDate, 
                    to_date: toDate 
                },
                headers
            });
            
            console.log(`Statement fetch successful for loan: ${loanId}`);
            return response.data;
        } catch (error) {
            console.error('Statement fetch failed:', error.response?.data || error.message);
            throw error;
        }
    }

    async getNDCDetails(loanId) {
        try {
            const headers = await this.getAuthHeaders();
            const response = await axios.get(`${this.baseURL}/api/loans/${loanId}/ndc`, {
                headers
            });
            
            console.log(`NDC details fetch successful for loan: ${loanId}`);
            return response.data;
        } catch (error) {
            console.error('NDC fetch failed:', error.response?.data || error.message);
            throw error;
        }
    }

    async getLoanDetails(loanId) {
        try {
            const headers = await this.getAuthHeaders();
            const response = await axios.get(`${this.baseURL}/api/loans/${loanId}/details`, {
                headers
            });
            
            console.log(`Loan details fetch successful for loan: ${loanId}`);
            return response.data;
        } catch (error) {
            console.error('Loan details fetch failed:', error.response?.data || error.message);
            throw error;
        }
    }

    async getCustomerLoans(customerId) {
        try {
            const headers = await this.getAuthHeaders();
            const response = await axios.get(`${this.baseURL}/api/customers/${customerId}/loans`, {
                headers
            });
            
            console.log(`Customer loans fetch successful for customer: ${customerId}`);
            return response.data;
        } catch (error) {
            console.error('Customer loans fetch failed:', error.response?.data || error.message);
            throw error;
        }
    }

    async sendOTP(mobileNumber) {
        try {
            const headers = await this.getAuthHeaders();
            const response = await axios.post(`${this.baseURL}/api/customers/send-otp`, {
                mobile_number: mobileNumber
            }, { headers });
            
            console.log(`OTP sent successfully to: ${mobileNumber}`);
            return response.data;
        } catch (error) {
            console.error('OTP sending failed:', error.response?.data || error.message);
            throw error;
        }
    }

    async verifyOTP(mobileNumber, otp) {
        try {
            const headers = await this.getAuthHeaders();
            const response = await axios.post(`${this.baseURL}/api/customers/verify-mobile`, {
                mobile_number: mobileNumber,
                otp: otp
            }, { headers });
            
            console.log(`OTP verification successful for: ${mobileNumber}`);
            return response.data;
        } catch (error) {
            console.error('OTP verification failed:', error.response?.data || error.message);
            throw error;
        }
    }

    // Health check method
    async healthCheck() {
        try {
            const headers = await this.getAuthHeaders();
            const response = await axios.get(`${this.baseURL}/api/health`, {
                headers
            });
            
            return response.data;
        } catch (error) {
            console.error('LMS health check failed:', error.response?.data || error.message);
            throw error;
        }
    }
}

module.exports = new LMSService();
