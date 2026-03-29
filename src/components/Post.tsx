import { useParams } from "react-router-dom";

// // Opisujemy TYLKO to, co przychodzi z adresu URL
// interface PostParams {
//   id: string; // bo w URL wszystko jest stringiem
// }

function Post() {
  const { id } = useParams(); // useParams domyślnie zwraca string | undefined
  // const { id, category } = useParams() as unknown as { id: string; category: string };

  if (!id) {
    return <div>Nie podano ID posta!</div>;
  }


  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold">Wyświetlasz post o ID: {id}</h1>
      <p>Tutaj React powinien poszukać w danych treści dla tego numeru.</p>
    </div>
  );
}

export default Post;