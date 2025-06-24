import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import './marketplace.scss'; // Import the SCSS file
const API_URL = import.meta.env.VITE_APP_MY_API_URL;
const IMAGE_URL = import.meta.env.VITE_MINIO_ENDPOINT;
const MySwal = withReactContent(Swal);

const Marketplace = () => {
  const [items, setItems] = useState([]);
  console.log(items)
  const fetchItems = async () => {
    try {
      const response = await fetch(`${API_URL}/api/marketplaceController`);
      const data = await response.json();
      setItems(data.data); 
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [setItems]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this item?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${API_URL}/api/marketplaceController/${id}`, {
          method: 'DELETE'
        });
        const data = await response.json();
        if (response.ok) {
          Swal.fire('Deleted!', 'Item deleted successfully.', 'success');
          fetchItems(); // Refresh list
        } else {
          Swal.fire('Error', data.message || 'Failed to delete item', 'error');
        }
      } catch (error) {
        Swal.fire('Error', 'Failed to delete item', 'error');
      }
    }
  };
  const handleUpdate = async (id) => {
    // Fetch the item by ID
    try {
      const response = await fetch(`${API_URL}/api/marketplaceController/${id}`);
      const data = await response.json();
      if (!response.ok || !data.data) {
        Swal.fire('Error', data.message || 'Failed to fetch item', 'error');
        return;
      }
      const item = data.data;
  
      // Show SweetAlert2 form pre-filled with item data
      const { value: formValues } = await MySwal.fire({
        title: 'Update Item',
        html:
          `<input id="swal-input1" class="swal2-input" placeholder="Title" value="${item.title || ''}" />` +
          `<input id="swal-input2" class="swal2-input" placeholder="Category" value="${item.category || ''}" />` +
          `<textarea id="swal-input3" class="swal2-textarea" placeholder="Description">${item.description || ''}</textarea>` +
          `<input id="swal-input4" class="swal2-input" placeholder="Price" type="number" value="${item.price || ''}" />` +
          `<input id="swal-input5" type="file" class="swal2-file" accept="image/*" />` +
          (item.imageUrl ? `<img src="${IMAGE_URL}${item.imageUrl}" alt="Current" style="width:80px;margin-top:10px;border-radius:4px;" />` : ''),
        focusConfirm: false,
        preConfirm: () => {
          return [
            document.getElementById('swal-input1').value,
            document.getElementById('swal-input2').value,
            document.getElementById('swal-input3').value,
            document.getElementById('swal-input4').value,
            document.getElementById('swal-input5').files[0]
          ];
        }
      });
  
      if (formValues) {
        const [title, category, description, price, imageFile] = formValues;
        if (!title || !category || !description || !price) {
          Swal.fire('All fields except image are required!');
          return;
        }
        const formData = new FormData();
        formData.append('title', title);
        formData.append('category', category);
        formData.append('description', description);
        formData.append('price', price);
        if (imageFile) {
          formData.append('imageUrl', imageFile);
        }
  
        // Send PUT request to update the item
        try {
          const updateResponse = await fetch(`${API_URL}/api/marketplaceController/${id}`, {
            method: 'PUT',
            body: formData
          });
          const updateData = await updateResponse.json();
          if (updateResponse.ok) {
            Swal.fire('Success', 'Item updated!', 'success');
            fetchItems(); // Refresh list
          } else {
            Swal.fire('Error', updateData.error || 'Failed to update item', 'error');
          }
        } catch (error) {
          Swal.fire('Error', 'Failed to update item', 'error');
        }
      }
    } catch (error) {
      Swal.fire('Error', 'Failed to fetch item', 'error');
    }
  };
  const insertData = async () => {
    const { value: formValues } = await MySwal.fire({
      title: 'Add New Item',
      html:
        `<input id="swal-input1" class="swal2-input" placeholder="Title" />` +
        `<input id="swal-input2" class="swal2-input" placeholder="Category" />` +
        `<textarea id="swal-input3" class="swal2-textarea" placeholder="Description"></textarea>` +
        `<input id="swal-input4" class="swal2-input" placeholder="Price" type="number" />` +
        `<input id="swal-input5" type="file" class="swal2-file" accept="image/*" />`,
      focusConfirm: false,
      preConfirm: () => {
        return [
          document.getElementById('swal-input1').value,
          document.getElementById('swal-input2').value,
          document.getElementById('swal-input3').value,
          document.getElementById('swal-input4').value,
          document.getElementById('swal-input5').files[0]
        ];
      }
    });

    if (formValues) {
      const [title, category, description, price, imageFile] = formValues;
      if (!title || !category || !description || !price || !imageFile) {
        Swal.fire('All fields are required!');
        return;
      }
      const formData = new FormData();
      formData.append('title', title);
      formData.append('category', category);
      formData.append('description', description);
      formData.append('price', price);
      formData.append('imageUrl', imageFile);

      try {
        const response = await fetch(`${API_URL}/api/marketplaceController`, {
          method: 'POST',
          body: formData
        });
        const data = await response.json();
        if (response.ok) {
          Swal.fire('Success', 'Item added!', 'success');
          
        } else {
          Swal.fire('Success', 'Item added!', 'success');
          fetchItems(); // Refresh list
        }
      } catch (error) {
        Swal.fire('Error', 'Failed to add item', 'error');
      }
    }
  };

  const handleInsert = () => {
    console.log('Insert new item');
  };
  return (
    <div className="marketplace">
      <b>Add New Item : <button onClick={insertData} className="insertData">Click Here</button></b>
      {/* <button className="insert-button" onClick={insertData}>Insert Item</button> */}
      <ul>
        {items.map(item => (
          <li key={item.id}>
            <span><b>Title :</b> {item.title}</span>
            <span><b>Category :</b>{item.category}</span>
            <span><b>Description :</b>{item.description}</span>
            <span><b>Price :</b>{item.price}</span>
            {item.imageUrl && (
              <img
                src={`${IMAGE_URL}${item.imageUrl}`}
                alt={item.title}
                style={{ width: "100px", height: "100px", objectFit: "cover", marginLeft: "10px" }}
              />
            )}
            <button onClick={() => handleUpdate(item.id)}>Update</button>
            <button 
              onClick={() => handleDelete(item.id)} 
              style={{ marginLeft: '90px' ,marginTop:'-30px'}}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Marketplace;
