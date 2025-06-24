const ReportedContentTable = ({ data, blockUser, muteUser, reportUser, restrictAccount }) => {
  if (!Array.isArray(data)) {
    return <p>No reported content available.</p>;  // Handle case when data is not an array
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Content ID</th>
          <th>User ID</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map((content) => (
          <tr key={content.id}>
            <td>{content.id}</td>
            <td>{content.userId}</td>
            <td>
              <button onClick={() => blockUser(content.userId)}>Block</button>
              <button onClick={() => muteUser(content.userId)}>Mute</button>
              <button onClick={() => reportUser(content.userId)}>Report</button>
              <button onClick={() => restrictAccount(content.userId)}>Restrict</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ReportedContentTable;