const axios = require('axios');
const FormData = require('form-data');

async function test() {
  try {
    const form = new FormData();
    form.append('title', 'Test Event Check Draft');
    form.append('category', 'Other');
    form.append('location', 'Nowhere');
    form.append('capacity', 50);
    form.append('date', '2026-05-01');
    form.append('registrationDeadline', '2026-04-20');
    form.append('description', 'test');
    form.append('isFeatured', 'false');
    form.append('isDraft', 'false');

    const res = await axios.post('http://localhost:5000/api/events', form, {
      headers: form.getHeaders()
    });
    console.log("Result:", res.data);
  } catch(e) {
    console.error(e.response ? e.response.data : e.message);
  }
}
test();
