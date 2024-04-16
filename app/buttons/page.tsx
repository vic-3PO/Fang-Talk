import { Button } from "@/components/ui/button";

const ButtonsPage = () => {
  return (
    <div className="p-4 space-y-4 flex flex-col max-w-[200px]">
      <Button>Default</Button>
      <Button variant="primary">Primário</Button>
      <Button variant="primaryOutline">Primário outline</Button>
      <Button variant="secondary">Secundário</Button>
      <Button variant="secondaryOutline">Secundário outline</Button>
      <Button variant="danger">Perigo</Button>
      <Button variant="dangerOutline">Perigo outline</Button>
      <Button variant="super">Super</Button>
      <Button variant="superOutline">Super outline</Button>
      <Button variant="ghost">Fantasminha</Button>
      <Button variant="sidebar">Sidebar</Button>
      <Button variant="sidebarOutline">Sidebar outline</Button>
    </div>
  );
};

export default ButtonsPage;
