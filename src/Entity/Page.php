<?php

namespace Octave\CMSBundle\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;
use Knp\DoctrineBehaviors\Contract\Entity\TranslatableInterface;
use Knp\DoctrineBehaviors\Model as ORMBehaviors;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @author Igor Lukashov <igor.lukashov@octavecms.com>
 *
 * @ORM\Entity(repositoryClass="Octave\CMSBundle\Repository\PageRepository")
 * @ORM\Table(
 *     name="octave_pages"
 * )
 * @ORM\HasLifecycleCallbacks
 * @UniqueEntity("path")
 */
class Page implements Blockable, TranslatableInterface
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
     * @var string
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private $name;

    /**
     * @var bool
     * @ORM\Column(type="boolean")
     */
    private $active = false;

    /**
     * @var bool
     * @ORM\Column(type="boolean")
     */
    private $readonly = false;

    /**
     * @var bool
     * @ORM\Column(name="include_in_menu", type="boolean")
     */
    private $includeInMenu = false;

    /**
     * @var bool
     * @ORM\Column(name="include_in_sitemap", type="boolean")
     */
    private $includeInSitemap = true;

    /**
     * @var string
     * @ORM\Column(type="string", length=255, unique=true)
     * @Assert\NotBlank()
     */
    private $path;

    /**
     * @var string
     * @ORM\Column(name="base_template", type="string", nullable=true)
     */
    private $baseTemplate;

    /**
     * @var string
     * @ORM\Column(type="string", length=512, nullable=true)
     */
    private $controller;

    /**
     * @var string
     * @ORM\Column(type="string", length=100, nullable=true)
     */
    private $type;

    /**
     * @var array
     * @ORM\Column(type="array", nullable=true)
     */
    private $options = [];

    /**
     * @var Content
     * @ORM\OneToMany(targetEntity="Octave\CMSBundle\Entity\Content", mappedBy="page", cascade={"persist"})
     */
    private $content;

    /**
     * @var array
     * @ORM\OneToMany(targetEntity="Block", mappedBy="page", fetch="EXTRA_LAZY", cascade={"persist", "remove"})
     * @ORM\OrderBy({"order" = "ASC"})
     */
    private $blocks;

    /**
     * @var int
     * @ORM\Column(type="integer")
     */
    private $position = 0;

    /**
     * @var Page
     * @ORM\ManyToOne(targetEntity="Page", inversedBy="children")
     * @ORM\JoinColumn(name="parent_id", referencedColumnName="id", onDelete="CASCADE")
     */
    private $parent;

    /**
     * @ORM\OneToMany(targetEntity="Page", mappedBy="parent")
     * @ORM\OrderBy({"position" = "ASC"})
     */
    private $children;

    /**
     * @var \DateTime
     * @ORM\Column(name="created_at", type="datetime")
     */
    private $createdAt;

    /**
     * @var \DateTime
     * @ORM\Column(name="updated_at", type="datetime")
     */
    private $updatedAt;

    /**
     * @ORM\PrePersist()
     */
    public function prePersist()
    {
        $this->createdAt = new \DateTime();
        $this->updatedAt = new \DateTime();
    }

    /**
     * @ORM\PreUpdate()
     */
    public function preUpdate()
    {
        $this->updatedAt = new \DateTime();
    }

    /**
     * @return string
     */
    public function __toString()
    {
        return (string) $this->translate()->getTitle();
    }

    /**
     * Page constructor.
     */
    public function __construct()
    {
        $this->blocks = new ArrayCollection();
    }

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
     * @return string
     */
    public function getName()
    {
        return $this->name;
    }

    /**
     * @param string $name
     */
    public function setName($name)
    {
        $this->name = $name;
    }

    /**
     * @return string
     */
    public function getPath()
    {
        return $this->path;
    }

    /**
     * @param string $path
     */
    public function setPath($path)
    {
        $this->path = $path;
    }

    /**
     * @return string
     */
    public function getType()
    {
        return $this->type;
    }

    /**
     * @param string $type
     */
    public function setType($type)
    {
        $this->type = $type;
    }

    /**
     * @return array
     */
    public function getOptions()
    {
        return $this->options;
    }

    /**
     * @param array $options
     */
    public function setOptions($options)
    {
        $this->options = $options;
    }

    /**
     * @return \DateTime
     */
    public function getCreatedAt()
    {
        return $this->createdAt;
    }

    /**
     * @param \DateTime $createdAt
     */
    public function setCreatedAt($createdAt)
    {
        $this->createdAt = $createdAt;
    }

    /**
     * @return \DateTime
     */
    public function getUpdatedAt()
    {
        return $this->updatedAt;
    }

    /**
     * @param \DateTime $updatedAt
     */
    public function setUpdatedAt($updatedAt)
    {
        $this->updatedAt = $updatedAt;
    }

    /**
     * @return bool
     */
    public function isActive()
    {
        return $this->active;
    }

    /**
     * @param bool $active
     */
    public function setActive($active)
    {
        $this->active = $active;
    }

    /**
     * @return string
     */
    public function getController()
    {
        return $this->controller;
    }

    /**
     * @param string $controller
     */
    public function setController($controller)
    {
        $this->controller = $controller;
    }

    /**
     * @param $name
     * @param $value
     */
    public function addOption($name, $value)
    {
        $this->options[$name] = $value;
    }

    /**
     * @param $name
     * @return mixed|null
     */
    public function getOption($name)
    {
        return $this->options[$name] ?? null;
    }

    /**
     * @param $name
     * @param $value
     */
    public function setOption($name, $value)
    {
        $this->options[$name] = $value;
    }

    /**
     * @return Content
     */
    public function getContent()
    {
        return $this->content;
    }

    /**
     * @param Content $content
     */
    public function setContent(Content $content)
    {
        $this->content = $content;
    }

    /**
     * @return array
     */
    public function getBlocks()
    {
        return $this->blocks;
    }

    /**
     * @param array|ArrayCollection $blocks
     */
    public function setBlocks($blocks)
    {
        $this->blocks = $blocks;
    }

    /**
     * @param $block
     */
    public function addBlock($block)
    {
        $this->blocks[] = $block;
    }

    /**
     * @return Page
     */
    public function getParent()
    {
        return $this->parent;
    }

    /**
     * @param Page $parent
     */
    public function setParent($parent)
    {
        $this->parent = $parent;
    }

    /**
     * @return int
     */
    public function getPosition()
    {
        return $this->position;
    }

    /**
     * @param int $position
     */
    public function setPosition($position)
    {
        $this->position = $position;
    }

    /**
     * @return mixed
     */
    public function getChildren()
    {
        return $this->children;
    }

    /**
     * @param mixed $children
     */
    public function setChildren($children)
    {
        $this->children = $children;
    }

    /**
     * @return bool
     */
    public function isReadonly()
    {
        return $this->readonly;
    }

    /**
     * @param bool $readonly
     */
    public function setReadonly($readonly)
    {
        $this->readonly = $readonly;
    }

    /**
     * @return bool
     */
    public function isIncludeInMenu()
    {
        return $this->includeInMenu;
    }

    /**
     * @param bool $includeInMenu
     */
    public function setIncludeInMenu($includeInMenu)
    {
        $this->includeInMenu = $includeInMenu;
    }

    /**
     * @return bool
     */
    public function isIncludeInSitemap()
    {
        return $this->includeInSitemap;
    }

    /**
     * @param bool $includeInSitemap
     */
    public function setIncludeInSitemap($includeInSitemap)
    {
        $this->includeInSitemap = $includeInSitemap;
    }

    /**
     * @return string
     */
    public function getBaseTemplate()
    {
        return $this->baseTemplate;
    }

    /**
     * @param $baseTemplate
     */
    public function setBaseTemplate($baseTemplate)
    {
        $this->baseTemplate = $baseTemplate;
    }
}