import { Button } from "@/components/ui/button";
import Image from "next/image";

export const Footer = () => {
  return (
    <footer className="hidden lg:block h-20 w-full border-t-2 border-slate-200 p-2">
      <div className="max-w-screen-lg mx-auto flex items-center justify-evenly h-full">
        <Button size="lg" variant="ghost" className="w-full">
          <Image
            src="/us.svg"
            alt="Ingles"
            height={32}
            width={40}
            className="mr-4 rounded-md"
          />
          Inglês
        </Button>
        <Button size="lg" variant="ghost" className="w-full">
          <Image
            src="/es.svg"
            alt="Espanhol"
            height={32}
            width={40}
            className="mr-4 rounded-md"
          />
          Espanhol
        </Button>
        <Button size="lg" variant="ghost" className="w-full">
          <Image
            src="/fr.svg"
            alt="Frances"
            height={32}
            width={40}
            className="mr-4 rounded-md"
          />
          Francês
        </Button>
        <Button size="lg" variant="ghost" className="w-full">
          <Image
            src="/kr.svg"
            alt="Coreano"
            height={32}
            width={40}
            className="mr-4 rounded-md"
          />
          Coreano
        </Button>
        <Button size="lg" variant="ghost" className="w-full">
          <Image
            src="/jp.svg"
            alt="Japones"
            height={32}
            width={40}
            className="mr-4 rounded-md"
          />
          Japonês
        </Button>
      </div>
    </footer>
  );
};
