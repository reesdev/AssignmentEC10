

class MedSyncAPI {
    constructor() {
        this.baseUrl = '/api/v1';
        this.authHeader = localStorage.getItem('auth_token') || '';
    }

    setToken(username, password) {
        this.authHeader = 'Basic ' + btoa(`${username}:${password}`);
        localStorage.setItem('auth_token', this.authHeader);
    }

    clearToken() {
        this.authHeader = '';
        localStorage.removeItem('auth_token');
    }

    async request(path, method = 'GET', body = null) {
        const url = `${this.baseUrl}${path}`;
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': this.authHeader
            }
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(url, options);
            
            if (response.status === 401) {
                this.log('Error: Unauthorized. Please check your credentials.', 'error');
                return null;
            }

            // Ambil text dulu untuk cek apakah kosong
            const text = await response.text();
            const data = text ? JSON.parse(text) : null;

            if (!response.ok) {
                this.log(`Error: Request failed with status ${response.status}`, 'error');
                return data;
            }
            
            return data;
        } catch (error) {
            this.log(`Error: ${error.message}`, 'error');
            return null;
        }
    }

    log(message, type = 'info') {
        const container = document.getElementById('log-container');
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        
        const time = new Date().toLocaleTimeString();
        entry.innerHTML = `<span class="log-time">${time}</span> ${message}`;
        
        container.prepend(entry);
    }
}

const api = new MedSyncAPI();


const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const usernameDisplay = document.getElementById('username-display');
const tokenDisplay = document.getElementById('token-display');
const tokenInfo = document.getElementById('token-info');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = document.getElementById('login-user').value;
    const pass = document.getElementById('login-pass').value;

    api.setToken(user, pass);
    
    // Test auth with health check
    const result = await api.request('/auth/health');
    if (result) {
        api.log(`Login successful as ${user}`, 'success');
        usernameDisplay.textContent = user;
        logoutBtn.classList.remove('hidden');
        tokenDisplay.textContent = api.authHeader.substring(0, 20) + '...';
        tokenInfo.classList.remove('hidden');
    }
});

logoutBtn.addEventListener('click', () => {
    api.clearToken();
    api.log('Logged out.', 'info');
    usernameDisplay.textContent = 'Not Signed In';
    logoutBtn.classList.add('hidden');
    tokenInfo.classList.add('hidden');
});


document.getElementById('refresh-patients').addEventListener('click', async () => {
    api.log('Refreshing patient list...', 'info');
    const result = await api.request('/customer/patients');
    if (result) {
        api.log(`Found ${result.length} patients`, 'success');
        document.getElementById('patient-data-box').innerHTML = result.length > 0 
            ? JSON.stringify(result, null, 2) 
            : 'No data';
    }
});

document.getElementById('create-patient').addEventListener('click', async () => {
    const patientData = {
        name: document.getElementById('p-name').value,
        nik: document.getElementById('p-nik').value,
        gender: document.getElementById('p-gender').value,
        phone: document.getElementById('p-phone').value,
        bloodType: document.getElementById('p-blood').value,
        address: document.getElementById('p-address').value
    };

    if (!patientData.name || !patientData.nik) {
        return api.log('Name and NIK are required', 'error');
    }

    api.log(`Creating patient ${patientData.name}...`, 'info');
    const result = await api.request('/customer/patients', 'POST', patientData);
    if (result) {
        api.log(`Patient created with ID: ${result.id}`, 'success');
        document.getElementById('patient-data-box').innerHTML = JSON.stringify(result, null, 2);
    }
});

document.getElementById('get-patient').addEventListener('click', async () => {
    const id = document.getElementById('lookup-id').value;
    if (!id) return api.log('Please enter a Patient ID', 'error');
    
    api.log(`Fetching patient ${id}...`, 'info');
    const result = await api.request(`/customer/patients/${id}`);
    if (result) {
        document.getElementById('patient-data-box').innerHTML = JSON.stringify(result, null, 2);
    } else {
        document.getElementById('patient-data-box').innerHTML = 'Patient not found';
    }
});

document.getElementById('delete-patient').addEventListener('click', async () => {
    const id = document.getElementById('lookup-id').value;
    if (!id) return api.log('Please enter a Patient ID to delete', 'error');
    
    api.log(`Deleting patient ${id}...`, 'info');
    const result = await api.request(`/customer/patients/${id}`, 'DELETE');
    api.log(`Patient ${id} deleted`, 'success');
    document.getElementById('patient-data-box').innerHTML = 'Deleted';
});


document.getElementById('book-btn').addEventListener('click', async () => {
    const bookingData = {
        patientId: document.getElementById('b-patient-id').value,
        roomId: document.getElementById('b-room-id').value
    };
    
    if (!bookingData.patientId || !bookingData.roomId) {
        return api.log('Patient ID and Room ID are required', 'error');
    }

    api.log(`Creating booking for Patient ${bookingData.patientId} in Room ${bookingData.roomId}...`, 'info');
    const result = await api.request('/management/manage/bookings', 'POST', bookingData);
    if (result) {
        api.log(`Booking created with ID: ${result.id}`, 'success');
        document.getElementById('booking-data-box').innerHTML = JSON.stringify(result, null, 2);
        document.getElementById('b-lookup-id').value = result.id;
    }
});

document.getElementById('refresh-bookings').addEventListener('click', async () => {
    api.log('Refreshing booking list...', 'info');
    const result = await api.request('/management/manage/bookings');
    if (result) {
        api.log(`Found ${result.length} bookings`, 'success');
        document.getElementById('booking-data-box').innerHTML = result.length > 0 
            ? JSON.stringify(result, null, 2) 
            : 'No bookings found';
    }
});

document.getElementById('view-booking').addEventListener('click', async () => {
    const id = document.getElementById('b-lookup-id').value;
    if (!id) return api.log('Please enter a Booking ID', 'error');
    
    api.log(`Fetching booking ${id}...`, 'info');
    const result = await api.request(`/management/manage/bookings/${id}`);
    if (result) {
        document.getElementById('booking-data-box').innerHTML = JSON.stringify(result, null, 2);
    } else {
        document.getElementById('booking-data-box').innerHTML = 'Booking not found';
    }
});

document.getElementById('checkout-booking').addEventListener('click', async () => {
    const id = document.getElementById('b-lookup-id').value;
    if (!id) return api.log('Please enter a Booking ID to checkout', 'error');
    
    api.log(`Checking out booking ${id}...`, 'info');
    const result = await api.request(`/management/manage/bookings/${id}/checkout`, 'PUT');
    if (result) {
        api.log(`Booking ${id} checked out successfully`, 'success');
        document.getElementById('booking-data-box').innerHTML = JSON.stringify(result, null, 2);
    } else {
        api.log(`Checkout failed. Make sure you have processed the payment first!`, 'error');
    }
});

document.getElementById('cancel-booking').addEventListener('click', async () => {
    const id = document.getElementById('b-lookup-id').value;
    if (!id) return api.log('Please enter a Booking ID to cancel', 'error');
    
    api.log(`Cancelling booking ${id}...`, 'info');
    const result = await api.request(`/management/manage/bookings/${id}/cancel`, 'PUT');
    if (result) {
        api.log(`Booking ${id} cancelled`, 'success');
        document.getElementById('booking-data-box').innerHTML = JSON.stringify(result, null, 2);
    }
});


const fetchRooms = async () => {
    api.log('Fetching rooms...', 'info');
    const result = await api.request('/management/manage/rooms');
    if (result) {
        document.getElementById('rooms-data-box').innerHTML = result.length > 0 
            ? JSON.stringify(result, null, 2) 
            : 'No rooms found. Please add rooms in DB.';
    }
};

document.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
        const filter = btn.getAttribute('data-filter');
        document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const dataBox = document.getElementById('rooms-data-box');
        const addForm = document.getElementById('add-room-form');

        if (filter === 'add') {
            dataBox.classList.add('hidden');
            addForm.classList.remove('hidden');
        } else {
            dataBox.classList.remove('hidden');
            addForm.classList.add('hidden');
            fetchRooms();
        }
    });
});

document.getElementById('save-room-btn').addEventListener('click', async () => {
    const roomData = {
        roomNumber: document.getElementById('r-number').value,
        type: document.getElementById('r-type').value,
        price: document.getElementById('r-price').value
    };

    if (!roomData.roomNumber || !roomData.price) {
        return api.log('Room number and price are required', 'error');
    }

    api.log(`Saving room ${roomData.roomNumber}...`, 'info');
    const result = await api.request('/management/manage/rooms', 'POST', roomData);
    if (result) {
        api.log(`Room ${result.roomNumber} saved successfully`, 'success');
        document.querySelector('[data-filter="all"]').click();
    }
});


document.getElementById('process-payment').addEventListener('click', async () => {
    const paymentData = {
        bookingId: document.getElementById('pay-booking-id').value,
        type: document.getElementById('pay-type').value,
        amount: document.getElementById('pay-amount').value,
        description: document.getElementById('pay-desc').value
    };

    if (!paymentData.bookingId || !paymentData.amount) {
        return api.log('Booking ID and Amount are required', 'error');
    }

    api.log(`[PAYMENT] Processing ${paymentData.amount} for Booking #${paymentData.bookingId}...`, 'info');
    const result = await api.request('/management/manage/payments', 'POST', paymentData);
    if (result) {
        api.log(`[SUCCESS] Payment processed. Receipt ID: ${result.id}`, 'success');
        api.log(`Payment Status: ${result.status}`, 'info');
        document.getElementById('refresh-payments').click();
    }
});

document.getElementById('refresh-payments').addEventListener('click', async () => {
    api.log('Refreshing payment history...', 'info');
    const result = await api.request('/management/manage/payments');
    if (result) {
        api.log(`Found ${result.length} payment records`, 'success');
        document.getElementById('payment-data-box').innerHTML = result.length > 0 
            ? JSON.stringify(result, null, 2) 
            : 'No payment history';
    }
});


document.getElementById('clear-logs').addEventListener('click', () => {
    document.getElementById('log-container').innerHTML = '';
});


window.addEventListener('load', () => {
    api.log('System initialized. Dashboard ready.', 'info');
    if (api.authHeader) {
        usernameDisplay.textContent = 'Admin (Restored)';
        logoutBtn.classList.remove('hidden');
    }
});
