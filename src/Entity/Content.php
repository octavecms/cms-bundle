<?php

namespace Octave\CMSBundle\Entity;

use Doctrine\ORM\Mapping as ORM;
use Knp\DoctrineBehaviors\Contract\Entity\TranslatableInterface;
use Knp\DoctrineBehaviors\Model as ORMBehaviors;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 *
 * @ORM\Entity(repositoryClass="Octave\CMSBundle\Repository\ContentRepository")
 * @ORM\Table(
 *     name="octave_page_content"
 * )
 */
class Content implements TranslatableInterface
{
    use ORMBehaviors\Translatable\TranslatableTrait;
    use TranslatableEntityTrait;

    /**
     * @ORM\Id
     * @ORM\Column(type="integer")
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @var Page
     *
     * @ORM\OneToOne(targetEntity="Octave\CMSBundle\Entity\Page", inversedBy="content")
     * @ORM\JoinColumn(name="page_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private $page;

    /**
     * @var string
     * @ORM\Column(type="string", length=512, nullable=true)
     */
    private $template;

    /**
     * @return mixed
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * @param mixed $id
     */
    public function setId($id)
    {
        $this->id = $id;
    }

    /**
     * @return Page
     */
    public function getPage()
    {
        return $this->page;
    }

    /**
     * @param Page $page
     */
    public function setPage(Page $page)
    {
        $this->page = $page;
    }

    /**
     * @return string
     */
    public function getTemplate()
    {
        return $this->template;
    }

    /**
     * @param string $template
     */
    public function setTemplate($template)
    {
        $this->template = $template;
    }
}